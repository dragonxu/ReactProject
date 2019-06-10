import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';     //
import {Input, Icon, Button, message, notification, Rate, Modal } from 'antd';  //
import { inject, observer} from 'mobx-react';
import Status from '../../common/status';
import http from '../../utils/Server';
import ReactMarkdown from 'react-markdown'
import './style.scss';
import GatewaysDrawer from '../../common/GatewaysDrawer';
import AppConfig from './AppConfig'
import LazyLoad from 'react-lazy-load';
import {ConfigStore} from '../../utils/app_config'

const Search = Input.Search;
const openNotification = (title, message) => {
    notification.open({
        message: title,
        description: message,
        placement: 'buttonRight'
    });
};

@withRouter
@inject('store')
@observer
class MyGatesAppsInstall extends Component {
    state = {
        app: '',
        gateway_sn: '',
        app_list: [],
        app_show: [],
        install_step: '', // Install step
        app_info: {},
        filter: {
            ventor: '',
            agreement: '',
            type: ''
        },
        config: [],
        gateway_list_visible: false,
        install_btn_disabled: false,
        configStore: new ConfigStore(),
        showLinkSelection: false
    };

    componentDidMount (){
        let app = this.props.match.params.app ? this.props.match.params.app : ''
        let gateway_sn = this.props.match.params.sn;
        let install_step = this.props.match.params.step ? this.props.match.params.step : ''
        if (this.props.match.params.app !== undefined && install_step === '') {
            install_step = 'view'
        }

        this.setState({
            app: app,
            install_step: install_step,
            gateway_sn: gateway_sn
        }, () => {
            if (install_step === 'install') {
                http.get('/api/applications_details?name=' + this.state.app).then(res=>{
                    this.setState({app_info: res.data})
                })
            } else {
               this.fetchStoreApps()
            }
        })
    }
    fetchStoreApps () {
        http.get('/api/store_list').then(res=>{
            this.setState({
                app_list: res.data,
                app_show: res.data
            })
            if (this.state.app && this.state.install_step === 'view') {
                let item = res.data.find(item => item.name === this.state.app)
                if (item) {
                    this.setState({
                        app_info: item
                    })
                }
            }
        });
    }

    searchApp (value){
        let { app_list } = this.state;
        let newdata = [];
        newdata = app_list.filter((item)=>item.app_name.toLowerCase().indexOf(value.toLowerCase()) !== -1);
        this.setState({
            app_show: newdata
        })
    }

    setUrl = (name, step) => {
        let arr = location.pathname.split('/');
        if (name === undefined) {
            arr.splice(3)
            return arr.join('/')
        }
        arr[3] = name;
        if (step && step.length > 0) {
            arr[4] = step
        }
        return arr.join('/')
    };

    //随机数
    rand = (min, max)=>{
        return Math.floor(Math.random() * (max - min)) + min;
    };

    //获取版本
    installLatestVersion = (app, sn, inst_name, configuration)=>{
        let url = ''
        let enable_beta = this.props.store.appStore.status.enable_beta
        if (enable_beta === 1) {
            url = '/api/applications_versions_latest?beta=1&app=';
        } else {
            url = '/api/applications_versions_latest?app=';
        }
        let version = 0;
        http.get(url + app).then(res=> {
            version = res.data;
            if (version > 0) {
                if (enable_beta === 1) {
                    message.success('网关安装当前应用最新beta版本!');
                } else {
                    message.success('网关安装当前应用最新版本!');
                }

                let params = {
                    gateway: sn,
                    inst: inst_name,
                    app: app,
                    version: version,
                    conf: configuration,
                    id: 'app_install/' + sn + '/' + inst_name + '/' + app + '/' + this.rand(10000, 99999)
                };
                this.appInstall(params, sn)
            } else {
                message.error('应用暂时没有版本，无法安装！');
                this.setState({ install_btn_disabled: false })
            }
        }).catch(err=> {
            err;
            message.error('安装应用最新版本失败!')
        })
    };

    //安装应用
    appInstall = (params, sn)=>{
        http.post('/api/gateways_applications_install', params).then(res=>{
            openNotification('提交任务成功', '网关' + sn + '安装' + params.inst + '应用.')
            if (res.ok === true) {
                let info = {
                    gateway: sn,
                    params: params
                }
                this.props.store.action.pushAction(res.data, '网关' + sn + '安装应用' + params.inst, '', info, 30000,  (result)=> {
                    if (result) {
                        this.setState({ showLinkSelection: true })
                    } else {
                        this.setState({ install_btn_disabled: false });
                    }
                })
            } else {
                this.setState({ install_btn_disabled: false });
                openNotification('安装应用' + this.refs.inst.value + '失败', '' + res.data.message);
            }
        }).catch( (err)=> {
            err;
            openNotification('提交任务失败', '网关' + sn + '安装' + params.inst + '应用.')
            this.setState({ install_btn_disabled: false });
        })
    };

    //判断是否已有实例名
    checkInstanceName =  (sn, inst_name) => new Promise((resolve, reject) => {
        http.get('/api/gateways_applications_list?gateway=' + sn).then(res=> {
            if (res.ok === true) {
                let names = Object.keys(res.data);
                let fond_dumplicate = false
                names && names.length > 0 && names.map(item => {
                    if (item === inst_name) {
                        fond_dumplicate = true
                    }
                })
                if (!fond_dumplicate) {
                    resolve()
                } else {
                    reject('实例名重复')
                }
            }
        }).catch(err=> {
            reject(err)
        });
    });

    onInstallSubmit = (inst_name, app_info, configuration)=>{
        this.setState({
            install_btn_disabled: true
        });
        if (inst_name === '' || inst_name === undefined) {
            message.error('实例名不能为空！');
            return;
        } else {
            //判断实例名是否存在
            this.checkInstanceName(this.state.gateway_sn, inst_name).then(()=>{
                this.installLatestVersion(app_info.name, this.state.gateway_sn, inst_name, configuration)
            }).catch(err=>{
                message.error(err)
                this.setState({ install_btn_disabled: false });
            });
        }
    };

    onClose = () => {
        this.setState({
            gateway_list_visible: false,
			install_btn_disabled: false
        })
    };

    showDrawer = () => {
        this.setState({
            gateway_list_visible: true
        })
    };
    onChangeGateway = () => {
        this.componentDidMount()
    }

    render () {
        const { gateway_sn, app_show, install_step, app_inst, app_info, showLinkSelection } = this.state;
        return (<div>
            <Status gateway={this.state.gateway_sn}/>
                <div className="AppInstall">
                    <Button
                        type="primary"
                        onClick={this.showDrawer}
                        className="listbutton"
                    >
                        <Icon type="swap"/><br />
                    </Button>
                    <GatewaysDrawer
                        gateway={this.state.gateway_sn}
                        onClose={this.onClose}
                        onChange={this.onChangeGateway}
                        visible={this.state.gateway_list_visible}
                    ></GatewaysDrawer>
                    <Modal
                        visible={showLinkSelection}
                        title="快捷选择"
                        closable={false}
                        keyboard
                        onCancel={()=>{
                            this.setState({install_step: 'view', showLinkSelection: false})
                        }}
                        footer={[
                            // <Button key="back" onClick={this.handleCancel}>
                            // Return
                            // </Button>,
                            // <Button key="submit" type="primary" loading={loading} onClick={this.handleOk}>
                            // Submit
                            // </Button>,
                        ]}
                    >
                        <Button
                            shape="round"
                            icon="download"
                            onClick={()=>{
                                this.setState({gateway_list_visible: true, showLinkSelection: false})
                            }}
                        >
                            安装到其他网管
                        </Button>
                        <Button
                            shape="round"
                            icon="download"
                            onClick={()=>{
                                this.setState({install_step: '', showLinkSelection: false})
                                if (this.state.app_list === undefined || this.state.app_list.length === 0) {
                                    this.fetchStoreApps()
                                }
                            }}
                        >
                            继续安装其他应用
                        </Button>
                        <Button type="primary"
                            shape="round"
                            icon="download"
                        >
                            <Link to={`/gateways/${gateway_sn}/appslist`}> 查看应用列表 </Link>
                        </Button>
                    </Modal>
                    <div className={install_step === '' ? 'hide appsdetail' : 'show appsdetail'}>
                    <Button
                        className="installbtn"
                        type="primary"
                        onClick={()=>{
                            if (install_step === 'install') {
                                this.setState({install_step: 'view'})
                            } else {
                                this.setState({install_step: 'install'})
                            }
                        }}
                    >
                        {
                            install_step === 'install' ? '查看应用描述' : '安装到网关'
                        }
                    </Button>
                        <Link
                            to={
                                this.setUrl()
                            }
                        >
                            <Icon
                                type="rollback"
                                className="back"
                                onClick={()=>{
                                    this.setState({
                                        install_step: ''
                                    })
                                    if (this.state.app_list === undefined || this.state.app_list.length === 0) {
                                        this.fetchStoreApps()
                                    }
                                }}
                            />
                        </Link>
                        <h2 style={{borderBottom: '1px solid #ccc', padding: 10}}>安装 {app_info.app_name} 到 {this.state.gateway_sn}</h2>
                        <div className={install_step !== 'install' ? 'show' : 'hide'}>
                            <div style={{display: 'flex' }}>
                                {
                                    app_info.icon_image
                                    ? <img src={'http://ioe.thingsroot.com/' + app_info.icon_image}
                                        alt=""
                                        style={{width: 128, height: 128}}
                                      />
                                    : ''
                                }
                                <div style={{display: 'flex', paddingTop: 20, paddingLeft: 20}}>
                                    <div style={{width: 500}}
                                        className="detail"
                                    >
                                        <p>发布者： {app_info.owner}</p>
                                        <p>通讯协议: {app_info.protocol}</p>
                                        <p>适配型号： {app_info.device_serial}</p>
                                    </div>
                                    <div  className="detail">
                                        <p>应用分类： {app_info.category}</p>
                                        <p>设备厂家: {app_info.device_supplier}</p>
                                        <p>应用价格： 免费</p>
                                    </div>
                                </div>
                            </div>
                            <div
                                id="box"
                                style={{marginTop: 20}}
                            >
                                <ReactMarkdown
                                    source={app_info && app_info.description && app_info.description}
                                />
                            </div>
                        </div>
                        <div className={install_step !== 'install' ? 'installapp hide' : 'installapp show'}>
                            <AppConfig
                                gateway_sn={gateway_sn}
                                configStore={this.state.configStore}
                                app_inst={app_inst}
                                inst_editable
                                disabled={this.state.install_btn_disabled}
                                app_info={app_info}
                                onSubmit={this.onInstallSubmit}
                            />
                        </div>
                    </div>
                    <div className={install_step === '' ? 'show' : 'hide'}>
                        <div className="installheader">
                           <div className="searchlist">
                               <Search
                                   key="33"
                                   placeholder="搜索应用名"
                                   onSearch={(value)=>{
                                       this.searchApp(value)
                                   }}
                                   style={{ width: 200, marginRight: 80}}
                               />
                               <Icon
                                   className="rollback"
                                   type="rollback"
                                   onClick={()=>{
                                       this.props.history.go(-1)
                                   }}
                               />
                           </div>
                        </div>
                        <div className="installcontent">
                            {
                                app_show && app_show.length > 0 && app_show.map((val, ind)=>{
                                    return (
                                        <LazyLoad
                                            key={ind}
                                            offsetTop={100}
                                        >
                                            <div
                                                className="item"
                                            >
                                                <Link
                                                    to={
                                                        this.setUrl(val.name)
                                                    }
                                                >
                                                    <img
                                                        src={`http://ioe.thingsroot.com/${val.icon_image}`}
                                                        alt="logo"
                                                        onClick={()=>{
                                                            this.setState({
                                                                install_step: 'view',
                                                                app_info: val
                                                            })
                                                        }}
                                                    />
                                                </Link>
                                                <div className="apptitle">
                                                    <p>{val.app_name}</p>
                                                    <div>
                                                        <Rate
                                                            disabled
                                                            defaultValue={val.star}
                                                            size="small"
                                                        />
                                                        <span onClick={()=>{
                                                            this.setState({
                                                                install_step: 'install',
                                                                app_info: val
                                                            })
                                                        }}
                                                        >
                                                            <Link
                                                                to={
                                                                    this.setUrl(val.name, 'install')
                                                                }
                                                            >
                                                                <Icon
                                                                    type="cloud-download"
                                                                />
                                                            </Link>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </LazyLoad>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default MyGatesAppsInstall;
