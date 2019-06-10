import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import {notification } from 'antd';  //
import { Switch, Redirect, withRouter} from 'react-router-dom';
import LoadableComponent from '../../utils/LoadableComponent';
import PrivateRoute from '../PrivateRoute';

const AppDetails = LoadableComponent(()=>import('../../router/AppDetails'));
const AppSettings = LoadableComponent(()=>import('../../router/AppSettings'));
const Home = LoadableComponent(()=>import('../../router/Home'));
const Gateways = LoadableComponent(()=>import('../../router/Gateways'));
const MyApps = LoadableComponent(()=>import('../../router/MyApps'));
const AppStore = LoadableComponent(()=>import('../../router/AppStore'));
const UserSettings = LoadableComponent(()=>import('../../router/UserSettings'));
const AccessKeys = LoadableComponent(()=>import('../../router/AccessKeys'));
const VirtualGateways = LoadableComponent(()=>import('../../router/VirtualGateways'));
const GatewayDevices = LoadableComponent(()=>import('../../router/GatewayDevices'));
const GatewayAppInstall = LoadableComponent(()=>import('../../router/GatewayAppInstall'));
const PlatformMessage = LoadableComponent(()=>import('../../router/PlatformMessage'));
const DeviceMessage = LoadableComponent(()=>import('../../router/DeviceMessage'));
const BrowsingHistory = LoadableComponent(()=>import('../../router/BrowsingHistory'));
const AppsInstall = LoadableComponent(()=>import('../../router/AppsInstall'));
const AppEditorCode = LoadableComponent(()=>import('../../router/AppEditorCode'));
const TemplateDetails = LoadableComponent(()=>import('../../router/TemplateDetails'));

import { doUpdate } from '../../utils/Action';

let timer;
const openNotification = (title, message) => {
    notification.open({
        message: title,
        description: message,
        placement: 'buttonRight'
    });
};

@inject('store')
@observer
class ContentMain extends Component {
    componentDidMount (){
        this.startTimer()
    }
    componentWillUnmount (){
        clearInterval(timer);
    }
    startTimer (){
       timer = setInterval(() => {
            let action_store = this.props.store.action;
            const { actions } = this.props.store.action;
            doUpdate(actions, function (action, status, message){
                action_store.setActionStatus(action.id, status, message)
                if (status === 'done') {
                    openNotification(action.title + '成功', message)
                }
                if (status === 'failed') {
                    openNotification(action.title + '失败', message)
                }
                if (status === 'timeout') {
                    openNotification(action.title + '超时', message)
                }
            })
        }, 1000);
    }
    render (){
        return (
            <Switch>
                <PrivateRoute
                    path="/home"
                    component={Home}
                    title={'Dashboard'}
                />
                <PrivateRoute
                    path="/gateways"
                    component={Gateways}
                    title={'我的网关'}
                />
                <PrivateRoute
                    path="/myapps"
                    component={MyApps}
                    title={'我的应用'}
                />
                <PrivateRoute
                    path="/appstore"
                    component={AppStore}
                    title={'应用商店'}
                />
                <PrivateRoute
                    path="/appdetails/:name/:action?"
                    component={AppDetails}
                    title={'应用详情'}
                />
                <PrivateRoute
                    path="/appsettings/:action?"
                    component={AppSettings}
                    title={'应用设置'}
                />
                <PrivateRoute
                    path="/appsettings/:action?/:app？"
                    component={AppSettings}
                    title={'应用设置'}
                />
                <PrivateRoute
                    path="/appsinstall/:sn/:app?/:step?"
                    component={AppsInstall}
                    title={'安装应用'}
                />
                <PrivateRoute
                    path="/appeditorcode/:app/:name"
                    component={AppEditorCode}
                    title={'代码编辑'}
                />
                <PrivateRoute
                    path="/template/:app/:name/:version?/:action?"
                    component={TemplateDetails}
                    title={'模板详情'}
                />
                <PrivateRoute
                    path="/account"
                    component={UserSettings}
                    title={'用户信息'}
                />
                <PrivateRoute
                    path="/accesskeys"
                    component={AccessKeys}
                    title={'访问授权码'}
                />
                <PrivateRoute
                    path="/virtualgateways"
                    component={VirtualGateways}
                    title={'虚拟网关'}
                />
                <PrivateRoute
                    path="/gatewaydevices/:sn"
                    component={GatewayDevices}
                    title={'设备列表'}
                />
                <PrivateRoute
                    path="/gatewayappsinstall/:sn"
                    component={GatewayAppInstall}
                    title={'安装应用'}
                />
                <PrivateRoute
                    path="/platformmessage"
                    component={PlatformMessage}
                    title={'平台消息'}
                />
                <PrivateRoute
                    path="/devicemessage/:sn/:time"
                    component={DeviceMessage}
                    title={'设备消息'}
                />

                <PrivateRoute
                    path="/browsinghistory/:sn/:vsn"
                    component={BrowsingHistory}
                    title={'Dashboard'}
                />
                <Redirect
                    from="/"
                    to="/home"
                />
            </Switch>
        );
    }
}

export default withRouter(ContentMain);