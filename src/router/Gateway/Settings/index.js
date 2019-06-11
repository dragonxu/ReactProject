import React, { Component } from 'react';
import { Card, Button, message } from 'antd';
import { inject, observer} from 'mobx-react';
import { withRouter, Link } from 'react-router-dom';
import http from '../../../utils/Server';
import axios from 'axios';
import echarts from 'echarts/lib/echarts';
import  'echarts/lib/chart/line';
import  'echarts/lib/chart/pie';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/tooltip';
import './style.scss';

import Upgrade from './Upgrade'
import SettingsEdit from './Edit'

function getMin (i, date) {
    let Dates = new Date(date - i * 60000)
    let min = Dates.getMinutes();
    if (min < 10){
      return '0' + min
    } else {
      return min;
    }
  }
@withRouter
@inject('store')
@observer
class GatewaySettings extends Component {
    state = {
        title: '',
        address: '',
        skynet_version_list: [],
        freeioe_version_list: [],
        loading: true,
        gateway: '',
        upgrading: false,
        flag: true,
        freeioe_latest_version: 0,
        skynet_latest_version: 0,
        update: false,
        barData: []
    }
    componentDidMount (){
        this.setState({
            gateway: this.props.gateway,
            loading: true
        }, ()=> {
            this.getAllData();
        })
    }
    UNSAFE_componentWillReceiveProps (nextProps){
        if (nextProps.gateway !== this.state.gateway){
            this.setState({
                gateway: nextProps.gateway,
                loading: true
            }, ()=> {
                this.getAllData();
            })
        }
    }
    componentWillUnmount () {
        window.removeEventListener('resize', this.resize, 20)
        clearInterval(this.timer)
        clearInterval(this.timer1)
    }
    resize () {
        this.myFaultTypeChart1 && this.myFaultTypeChart1.resize();
        this.myFaultTypeChart2 && this.myFaultTypeChart2.resize();
    }
    fetchFreeIOEVersion () {
        const { gatewayInfo } = this.props.store;
        http.get('/api/applications_versions_list?app=FreeIOE&beta=' + (gatewayInfo.data.enable_beta ? 1 : 0)).then(res=>{
            const arr = [];
            res.data && res.data.length > 0 && res.data.map(item=>{
                if (item.version > gatewayInfo.data.version){
                    if (gatewayInfo.data.enable_beta){
                        arr.push(item)
                    } else {
                        if (item.beta === 0){
                            arr.push(item)
                        }
                    }
                }
            })
            this.setState({
                freeioe_version_list: arr
            })
        })

        http.get('/api/applications_versions_latest?app=freeioe&beta=' + (gatewayInfo.data.enable_beta ? 1 : 0)).then(res=>{
            this.setState({
                freeioe_latest_version: res.data
            })
        })
    }
    fetchSkynetVersion () {
        const { gatewayInfo } = this.props.store;
        http.get('/api/applications_versions_list?app=' + gatewayInfo.data.platform + '_skynet&beta=' + (gatewayInfo.data.enable_beta ? 1 : 0)).then(res=>{
            const arr = [];
            res.data && res.data.length > 0 && res.data.map(item=>{
                if (item.version > gatewayInfo.data.skynet_version){
                    if (gatewayInfo.data.enable_beta){
                        arr.push(item)
                    } else {
                        if (item.beta === 0){
                            arr.push(item)
                        }
                    }
                }
            })
            this.setState({
                skynet_version_list: arr
            })
        })

        http.get('/api/applications_versions_latest?app=' + gatewayInfo.data.platform + '_skynet&beta=' + (gatewayInfo.data.enable_beta ? 1 : 0)).then(res=>{
            this.setState({
                skynet_version: res.data
            })
        })
    }
    fetchGatewayAddress () {
        const { gatewayInfo } = this.props.store;
        axios.get('https://restapi.amap.com/v3/geocode/regeo?key=bac7bce511da6a257ac4cf2b24dd9e7e&location=' + gatewayInfo.longitude + ',' + gatewayInfo.latitude).then(location=>{
            if (location.data.regeocode){
                this.setState({address: location.data.regeocode.formatted_address});
            } else {
                this.setState({address: '- -'});
            }
        })
    }
    fetchGatewayData () {
        const { gateway } = this.state;
        http.get('/api/gateways_read?name=' + gateway).then(res=>{
            if (res.ok) {
                if (res.data.sn !== this.state.gateway) {
                    console.log('Delayed data arrived!!', res.data, this.state.gateway)
                    return
                }
                this.props.store.gatewayInfo.updateStatus(res.data);
            }
        })
    }
    fetchCharts () {
        const { gateway } = this.state;
        http.get(`/api/gateways_historical_data?sn=${gateway}&tag=cpuload&vt=float&time_condition=time > now() -10m&value_method=raw&group_time_span=5s&_=${new Date() * 1}`).then(res=>{
            let data = [];
            const date = new Date() * 1;
            for (var i = 0;i < 10;i++){
            data.unshift(new Date(date - (i * 60000)).getHours() + ':' + getMin(i, date));
            }
            let myCharts1 = this.refs.cpu
            if (myCharts1) {
                this.myFaultTypeChart1 = echarts.init(myCharts1);
                this.myFaultTypeChart1.setOption({
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'cross'
                        }
                    },
                    xAxis: {
                        data: data
                    },
                    yAxis: {},
                    series: [
                    {
                        name: '数值',
                        type: 'line',
                        color: '#37A2DA',
                        data: res.data
                    }
                    ]
                });
                window.addEventListener('resize', this.resize, 20);
                }
        })
        http.get(`/api/gateways_historical_data?sn=${gateway}&tag=mem_used&vt=int&time_condition=time > now() -10m&value_method=raw&group_time_span=5s&_=${new Date() * 1}`).then(res=>{
            let data = [];
            const date = new Date() * 1;
            for (var i = 0;i < 10;i++){
            data.unshift(new Date(date - (i * 60000)).getHours() + ':' + getMin(i, date));
            }
            let myCharts2 = this.refs.mem
            if (myCharts2) {
                this.myFaultTypeChart2 = echarts.init(myCharts2);
                this.myFaultTypeChart2.setOption({
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'cross'
                        }
                    },
                    xAxis: {
                        data: data
                    },
                    yAxis: {},
                    series: [
                    {
                        name: '数值',
                        type: 'line',
                        color: '#37A2DA',
                        data: res.data
                    }
                    ]
                });
                window.addEventListener('resize', this.resize, 20);
                }
        })
    }
    getAllData (){
        const { gateway } = this.state;
        http.get('/api/gateways_read?name=' + gateway).then(res=>{
            if (!res.ok) {
                message.error(res.error)
                return
            }
            this.props.store.gatewayInfo.updateStatus(res.data);
            this.setState({loading: false})
            this.fetchFreeIOEVersion()
            this.fetchSkynetVersion()
            this.fetchGatewayAddress()
        })
        this.fetchCharts()
    }
    render () {
        const { gatewayInfo } = this.props.store;
        const { upgrading, flag, title, update, freeioe_version_list, skynet_version_list,
            loading, freeioe_latest_version, skynet_latest_version } = this.state;
        return (
            <div className="settings">
                <div className={flag && !update ? 'linkstatuswrap show flex' : 'linkstatuswrap hide'}>
                    <div style={{ background: '#ECECEC', padding: '30px' }}
                        className="linkstatus"
                    >
                        <div className="setbutton">
                            <Button
                                disabled={!gatewayInfo.actionEnable}
                                onClick={()=>{
                                    this.setState({update: true})
                                }}
                            >高级设置</Button>
                        </div>
                        <div className="border">
                            <Card title="| 基本信息"
                                bordered={false}
                                style={{ width: '100%' }}
                                loading={loading}
                            >
                            <p><b>序列号：</b>{gatewayInfo.sn}</p>
                            <p><b>位置：</b> {gatewayInfo.address} </p>
                            <p><b>名称：</b>{gatewayInfo.dev_name}</p>
                            <p><b>描述：</b>{gatewayInfo.description}</p>
                            <p><b>型号：</b>{gatewayInfo.model ? gatewayInfo.model : 'Q102'}</p>
                            </Card>
                            <Card title="| 配置信息"
                                bordered={false}
                                style={{ width: '100%' }}
                                loading={loading}
                            >
                            <p><b>CPU:</b>{gatewayInfo.cpu}</p>
                            <p><b>内存:</b>{gatewayInfo.ram}</p>
                            <p><b>存储:</b>{gatewayInfo.rom}</p>
                            <p><b>操作系统:</b>{gatewayInfo.os}</p>
                            <p><b>核心软件:</b>{gatewayInfo.data && gatewayInfo.data.skynet_version}{skynet_latest_version > (gatewayInfo.data ? gatewayInfo.data.skynet_version : 0)
                            ? <Link
                                to="#"
                                style={{marginLeft: 200}}
                                onClick={()=>{
                                    this.setState({update: false, flag: false, title: 'openwrt x86_64_skynet'})
                                }}
                              >发现新版本></Link> : ''}</p>
                            <p><b>业务软件:</b>{gatewayInfo.data && gatewayInfo.data.version}{freeioe_latest_version >  (gatewayInfo.data ? gatewayInfo.data.version : 0)
                            ? <Link
                                to="#"
                                style={{marginLeft: 200}}
                                onClick={()=>{
                                    this.setState({update: false, flag: false, title: 'FreeIOE'})
                                }}
                              >发现新版本></Link> : ''}</p>
                            {/* <p><b>公网IP:</b>{gatewayInfo.public_ip}</p> */}
                            <p><b>调试模式:</b>{gatewayInfo.data && gatewayInfo.data.enable_beta === 1 ? '开启' : '关闭'}</p>
                            <p><b>数据上传:</b>{gatewayInfo.data && gatewayInfo.data.data_upload ? '开启' : '关闭'}</p>
                            <p><b>统计上传:</b>{gatewayInfo.data && gatewayInfo.data.stat_upload ? '开启' : '关闭'}</p>
                            <p><b>日志上传:</b>{gatewayInfo.data && gatewayInfo.data.event_upload}</p>
                            </Card>
                        </div>
                    </div>
                    <div className="rightecharts">
                        <Card className="border">
                            <p>CPU负载</p>
                            <div
                                style={{height: 280, width: '100%', minWidth: 300}}
                                id="CPU"
                                ref="cpu"
                            ></div>
                        </Card>
                        <Card className="border">
                            <p>内存负载</p>
                            <div
                                style={{height: 280, width: '100%', minWidth: 300}}
                                id="memory"
                                ref="mem"
                            ></div>
                        </Card>
                    </div>
                 </div>
                <div className={flag && update === true ? 'linkstatuswrap show' : 'linkstatuswrap hide'}>
                    <SettingsEdit
                        gatewayInfo={gatewayInfo}
                        gateway={this.state.gateway}
                        refreshGatewayData={this.fetchGatewayData}
                    />
            </div>
                <div className={!flag && !update ? 'update show' : 'update hide'}>
                    <Button
                        onClick={()=>{
                            this.setState({update: false, flag: true})
                        }}
                    >X</Button>
                    <Upgrade
                        gatewayInfo={gatewayInfo}
                        title={title}
                        upgrading={upgrading}
                        freeioe_latest_version={freeioe_latest_version}
                        skynet_latest_version={skynet_latest_version}
                        version_data={freeioe_version_list}
                        skynet_version_data={skynet_version_list}
                        onUpgrade={()=>{
                            this.setState({upgrading: true})
                            const data = gatewayInfo.data && gatewayInfo.data.skynet_version < skynet_latest_version
                            ? {
                                name: gatewayInfo.sn,
                                skynet_version: skynet_latest_version,
                                version: freeioe_latest_version,
                                no_ack: 1,
                                id: `sys_upgrade/${gatewayInfo.sn}/${new Date() * 1}`
                            }
                            : {
                                name: gatewayInfo.sn,
                                version: freeioe_latest_version,
                                no_ack: 1,
                                id: `sys_upgrade/${gatewayInfo.sn}/${new Date() * 1}`
                            }
                            http.post('/api/gateways_upgrade', data).then(res=>{
                                if (res.ok) {
                                    this.props.store.action.pushAction(res.data, '网关固件升级', '', data, 10000,  (result)=> {
                                        if (result.ok){
                                            this.setState({update: false, flag: true})
                                        } else {
                                            this.setState({upgrading: false})
                                        }
                                    })
                                } else {
                                    message.error('网关固件升级失败！ 错误:' + res.error)
                                    this.setState({upgrading: false})
                                }
                            }).catch((err)=>{
                                message.error('网关固件升级失败！ 错误:' + err)
                                this.setState({upgrading: false})
                            })
                        }}
                    />
                </div>
            </div>
        );
    }
}

export default GatewaySettings;