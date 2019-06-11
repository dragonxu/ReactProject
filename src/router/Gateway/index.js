import React, { Component } from 'react';
import { withRouter, Switch, Redirect } from 'react-router-dom';
import GatewayStatus from '../../common/GatewayStatus';
import LeftNav from '../../components/LeftNav';
import LoadableComponent from '../../utils/LoadableComponent';
import GatewayRoute from '../../components/GatewayRoute';
import './style.scss';
import http from '../../utils/Server';
import { inject, observer } from 'mobx-react';
import { Button, Icon, message } from 'antd';
import GatewayMQTT from '../../utils/GatewayMQTT';

const DeviceList = LoadableComponent(()=>import('./DeviceList'));
const AppsList = LoadableComponent(()=>import('./AppsList'));
const Settings = LoadableComponent(()=>import('./Settings'));
const VPN  = LoadableComponent(()=>import('./VPN'));
const Vserial = LoadableComponent(()=>import('./Vserial'));
const OnlineRecords = LoadableComponent(()=>import('./OnlineRecords'));
const Logviewer = LoadableComponent(()=>import('./Logviewer'));
const Comm = LoadableComponent(()=>import('./CommViewer'));
const Appconfig = LoadableComponent(()=>import('../AppsInstall/AppConfig'));
const Platformevent = LoadableComponent(()=>import('../PlatformMessage'));
const Devicesevent = LoadableComponent(()=>import('../DeviceMessage'));
const GatewaysDrawer = LoadableComponent(()=>import('../../common/GatewaysDrawer'));

@withRouter
@inject('store')
@observer
class MyGatesDevices extends Component {
    constructor (props){
        super(props);
        this.data_len = 0
        this.state = {
            gateway: '',
            visible: false,
            url: window.location.pathname,
            mqtt: new GatewayMQTT()
        }
    }
    componentDidMount (){
        this.setState({gateway: this.props.match.params.sn}, ()=>{
            this.sendAjax()
            this.props.store.timer.setGateStatusLast(0)
        })
    }
    UNSAFE_componentWillReceiveProps (nextProps){
        if (this.props.match.params.sn !== nextProps.match.params.sn){
            this.setState({gateway: nextProps.match.params.sn}, ()=>{
                this.state.mqtt.disconnect(true)
                this.sendAjax()
                this.props.store.timer.setGateStatusLast(0)
            })
        }
    }
    sendAjax = () => {
        const {gateway} = this.state;
        if (gateway === undefined || gateway === '') {
            return;
        }
        http.get('/api/gateways_app_list?gateway=' + gateway).then(res=>{
            if (res.ok) {
                this.props.store.gatewayInfo.setApps(res.data);
            } else {
                message.error(res.error)
            }
        })
        http.get('/api/gateways_dev_list?gateway=' + gateway).then(res=>{
            if (res.ok) {
                this.props.store.gatewayInfo.setDevices(res.data)
            } else {
                message.error(res.error)
            }
        })
    }
    showDrawer = () => {
        this.setState({
            visible: true
        })
    }
    onClose = () => {
        this.setState({
            visible: false
        })
    }
    onChangeGateway = () => {
        this.componentDidMount()
    }
    // setUrl = (sn) => {
    //   let arr = location.pathname.split('/');
    //   arr[2] = sn;
    //   return arr.join('/')
    // }
    render () {
      const { path } = this.props.match;
        return (
            <div>
                <GatewayStatus gateway={this.state.gateway}/>
                    <div className="mygatesdevices">
                        <LeftNav
                            prop={this.props.match.params}
                            gateway={this.state.gateway}
                            mqtt={this.state.mqtt}
                        />
                        <Button type="primary"
                            onClick={this.showDrawer}
                            className="listbutton"
                        >
                            <Icon type="swap"/><br />
                        </Button>
                    <GatewaysDrawer
                        gateway={this.state.gateway}
                        onClose={this.onClose}
                        onChange={this.onChangeGateway}
                        visible={this.state.visible}
                    />
                    <div className="mygateslist">
                      <Switch>
                        <GatewayRoute path={`${path}/devsList`}
                            component={DeviceList}
                            title="我的网关·设备列表"
                            gateway={this.state.gateway}
                        />
                        <GatewayRoute path={`${path}/appslist`}
                            component={AppsList}
                            title="我的网关·应用列表"
                            gateway={this.state.gateway}
                        />
                        <GatewayRoute path={`${path}/settings`}
                            component={Settings}
                            title="我的网关·网关设置"
                            gateway={this.state.gateway}
                        />
                        <GatewayRoute path={`${path}/vpn`}
                            component={VPN}
                            title="我的网关·vpn通道"
                            gateway={this.state.gateway}
                        />
                        <GatewayRoute path={`${path}/vserial`}
                            component={Vserial}
                            title="我的网关·虚拟串口"
                            gateway={this.state.gateway}
                        />
                        <GatewayRoute path={`${path}/onlinerecords`}
                            component={OnlineRecords}
                            title="我的网关·在线记录"
                            gateway={this.state.gateway}
                        />
                        <GatewayRoute path={`${path}/logviewer`}
                            component={Logviewer}
                            title="我的网关·日志"
                            mqtt={this.state.mqtt}
                            gateway={this.state.gateway}
                        />
                        <GatewayRoute path={`${path}/commviewer`}
                            component={Comm}
                            title="我的网关·报文"
                            mqtt={this.state.mqtt}
                            gateway={this.state.gateway}
                        />
                        <GatewayRoute path={`${path}/platformevent`}
                            component={Platformevent}
                            title="我的网关·平台事件"
                            gateway={this.state.gateway}
                        />
                        <GatewayRoute path={`${path}/devicesevent`}
                            component={Devicesevent}
                            title="我的网关·设备事件"
                            gateway={this.state.gateway}
                        />
                        <GatewayRoute path="/gateways/appconfig"
                            component={Appconfig}
                            title="我的网关·应用配置"
                            gateway={this.state.gateway}
                        />
                        <Redirect from={path}
                            to={`${path}/devslist`}
                        />
                      </Switch>
                    </div>
                </div>
            </div>
        );
    }
}
export default MyGatesDevices;