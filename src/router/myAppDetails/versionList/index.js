import React, { PureComponent } from 'react';
import { Button } from 'antd';
// import http from '../../../utils/Server';
import CollectionCreateForm from '../upData';
import {inject, observer} from 'mobx-react';

const block = {
    display: 'block'
};
const none = {
    display: 'none'
};
@inject('store')
@observer
class VersionList extends PureComponent {
    state = {
        user: '',
        name: ''
    };

    showModal = () => {
        this.props.store.codeStore.setVersionVisible(true)
    };

    handleCancel = () => {
        this.props.store.codeStore.setVersionVisible(false)
    };

    render () {
        let { app } = this.props;
        let { versionList } = this.props.store.codeStore;
        return (
            <div className="versionList">
                <div>
                    <Button
                        type="primary"
                        onClick={this.showModal}
                    >
                        上传新版本
                    </Button>
                    <CollectionCreateForm
                        visible={this.props.store.codeStore.versionVisible}
                        onCancel={this.handleCancel}
                        app={app}
                    />
                </div>
                <ul>
                    {
                        versionList && versionList.length > 0 && versionList.map((v, key)=>{
                                return <li key={key}>
                                    <div><p>版本号：<span className="fontColor">{v.version}</span>
                                        {
                                            v.meta === 0 ? <span>(正式版)</span> : <span>(测试版)</span>
                                        }
                                    </p></div>
                                    <div><p>更新时间：<span className="fontColor">{v.modified.substr(0, 19)}</span></p>
                                        {
                                            v.meta === 0 ? '' : <a style={this.state.user ? block : none}>发布为正式版本</a>
                                        }
                                    </div>
                                    <div><p>更新日志：<span className="fontColor">{v.comment}</span></p></div>
                                </li>
                            })

                    }
                </ul>
                <p
                    className="empty"
                    style={versionList.length > 0 ? none : block}
                >请先上传版本！</p>
            </div>
        );
    }
}

export default VersionList;