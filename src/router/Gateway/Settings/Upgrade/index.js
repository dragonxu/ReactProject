import React, { Component } from 'react';
import { inject, observer} from 'mobx-react';
import { Card, Button, Icon } from 'antd';


@inject('store')
@observer
class GatewayUpgrade extends Component {
    render () {
        const { actionEnable } = this.props.store.gatewayInfo;
        const { config, version, skynet_version, title, upgrading, version_data, skynet_version_data, onUpgrade } = this.props;
        return (
            <div>
                <div className="title">
                    <p>固件升级</p>
                    <div>
                        <div className="Icon">
                            <Icon type="setting" />
                        </div>
                        <div>
                            <h3>FreeIOE</h3>
                            <p>
                                <span>
                                {config.data && config.data.version < version  ? config.data.version : 0} -> {version}
                                </span>
                            </p>
                        </div>
                        {
                            config.data && skynet_version && config.data.skynet_version && config.data.skynet_version >= skynet_version
                            ? ''
                            : <div style={{display: 'flex'}}>
                                    <div className="Icon"
                                        style={{marginLeft: 100}}
                                    >
                                    <Icon type="setting" />
                                </div>
                                <div>
                                    <h3>openwrt x86_64_skynet</h3>
                                    <p>
                                        <span>
                                        {config.data && config.data.skynet_version < skynet_version  ? config.data.skynet_version : 0} -> {skynet_version}
                                        </span>
                                    </p>
                                    <span>
                                    {title === 'FreeIOE'
                                        ? config.data && config.data.version === version
                                            ? '已经是最新版' : '可升级到最新版'
                                        : config.data && config.data.skynet_version === skynet_version
                                            ? '已经是最新版' : '可升级到最新版'
                                    }</span>
                                </div>
                            </div>
                        }
                    </div>
                    {
                        config.data && config.data.version < version
                        ? <Button
                            type="primary"
                            disabled={upgrading || !actionEnable}
                            onClick={onUpgrade}
                          >升级更新</Button> : <Button>检查更新</Button>
                    }
                </div>
                <div style={{display: 'flex', flexWrap: 'wrap'}}>
                    <div style={{width: '50%', padding: 10, boxSizing: 'border-box'}}>
                    <h1>FreeIOE</h1>
                        {
                            version_data && version_data.length > 0 && version_data.map((v, i)=>{
                                return (
                                    <Card
                                        title={`应用名称：${v.app_name}`}
                                        key={i}
                                        style={{marginTop: 10, lineHeight: '30px'}}
                                    >
                                        <p>版本号：{v.version}</p>
                                        <p>更新时间：{v.modified.split('.')[0]}</p>
                                        <p dangerouslySetInnerHTML={{ __html: '更新内容: ' + v.comment.replace(/\n/g, '<br />') }}></p>
                                    </Card>
                                )
                            })
                        }
                    </div>
                    <div style={{width: '50%', padding: 10}}>
                    {
                        config.data && config.data.skynet_version < skynet_version
                        ? <h1>{config.platform}_skynet</h1>
                        : ''
                    }
                        {
                            skynet_version_data && skynet_version_data.length > 0 && skynet_version_data.map((v, i)=>{
                                return (
                                    <Card
                                        title={`应用名称：${v.app_name}`}
                                        key={i}
                                        style={{marginTop: 10, lineHeight: '30px'}}
                                    >
                                        <p>版本号：{v.version}</p>
                                        <p>更新时间：{v.modified.split('.')[0]}</p>
                                        <p dangerouslySetInnerHTML={{ __html: '更新内容: ' + v.comment.replace(/\n/g, '<br />') }}></p>
                                    </Card>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
        )
    }
}


export default GatewayUpgrade