import React, { PureComponent } from 'react';
import { Icon, message, Menu, Dropdown } from 'antd';
import { withRouter, Link} from 'react-router-dom';
import { _getCookie, isAuthenticated, authenticateClear } from '../../utils/Session';
import http  from '../../utils/Server';
import OEM from '../../assets/OEM';

@withRouter
class HeaderBar extends PureComponent {
    UNSAFE_componentWillReceiveProps () {
        if (!isAuthenticated()) {
            this.props.history.push('/login')
        }
    }
    render () {
        const menu1 = (
            <Menu>
                <Menu.Item
                    key="16"
                    style={{lineHeight: '30px'}}
                    onClick={
                        ()=>{
                            window.open('http://help.cloud.thingsroot.com/guide/quick_start/', '_blank')
                        }
                    }
                >
                    <Icon type="monitor" />
                    <span>
                        快速入门
                    </span>
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                    key="17"
                    style={{lineHeight: '30px'}}
                    onClick={
                        ()=>{
                            window.open('http://help.cloud.thingsroot.com/guide/', '_blank')
                        }
                    }
                >
                    <Icon type="read" />
                    <span>
                        产品介绍
                    </span>
                </Menu.Item>
                <Menu.Item
                    key="18"
                    style={{lineHeight: '30px'}}
                    onClick={
                        ()=>{
                            window.open('http://help.cloud.thingsroot.com/guide/user_guide/', '_blank')
                        }
                    }
                >
                    <Icon type="read" />
                    <span>
                        用户指南
                    </span>
                </Menu.Item>
                <Menu.Item
                    key="19"
                    style={{lineHeight: '30px'}}
                    onClick={
                        ()=>{
                            window.open('http://help.cloud.thingsroot.com/guide/admin_guide/ ', '_blank')
                        }
                    }
                >
                    <Icon type="read" />
                    <span>
                        管理员指南
                    </span>
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                    key="20"
                    style={{lineHeight: '30px'}}
                    onClick={
                        ()=>{
                            window.open('http://help.cloud.thingsroot.com/app_api_book/', '_blank')
                        }
                    }
                >
                    <Icon type="read" />
                    <span>
                        应用开发指南
                    </span>
                </Menu.Item>

            </Menu>
        )
        const menu = (
            <Menu style={{width: 160}}>
                <Menu.Item
                    key="12"
                    style={{lineHeight: '30px'}}
                    onClick={
                        ()=>{
                            window.location.href = '/account'
                        }
                    }
                >
                    <Icon type="setting"/>
                    <span>
                        个人设置
                    </span>
                </Menu.Item>
                <Menu.Item
                    key="13"
                    style={{lineHeight: '30px'}}
                    onClick={
                        ()=>{
                            window.location.href = '/virtualgateways'
                        }
                    }
                >
                    <Icon type="laptop" />
                    <span>
                        虚拟网关
                    </span>
                </Menu.Item>

                <Menu.Item
                    key="14"
                    style={{lineHeight: '30px'}}
                    onClick={
                        ()=>{
                            window.location.href = '/accesskeys'
                        }
                    }
                >
                    <Icon type="key" />
                    <span>
                        Accesskeys
                    </span>
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                    key="15"
                    style={{lineHeight: '30px'}}
                    onClick={()=>{
                        http.post('/api/user_logout').then(res=>{
                            res;
                            authenticateClear();
                            message.success('退出成功,即将跳转至登录页', 1.5).then(()=>{
                                location.href = '/'
                            })
                        }).catch(err=>{
                            err;
                            message.error('退出失败!!')
                        });
                    }}
                >
                    <Icon type="poweroff" />
                    <span>
                        退出登录
                    </span>
                </Menu.Item>
            </Menu>
        );
        // const menu2 = (
        //     <Menu style={{width: 160}}>
        //         <Menu.Item
        //             key="18"
        //             style={{lineHeight: '30px'}}
        //             onClick={
        //                 ()=>{
        //                     this.props.history.push('/member')
        //                 }
        //             }
        //         >
        //             <Icon type="team" />
        //             <span>
        //                 成员管理
        //             </span>
        //         </Menu.Item>
        //         <Menu.Item
        //             key="19"
        //             style={{lineHeight: '30px'}}
        //             onClick={
        //                 ()=>{
        //                     this.props.history.push('/sharegroup')
        //                 }
        //             }
        //         >
        //             <Icon type="share-alt"/>
        //             <span>
        //                 共享组管理
        //             </span>
        //         </Menu.Item>
        //     </Menu>
        // )
        return (
            <div className="headerUser">
                <Link
                    to="/appstore"
                    style={{marginRight: '15px'}}
                ><Icon type="appstore"/>&nbsp;&nbsp;应用市场</Link>
                <Link
                    to="/enterprise"
                    style={{marginRight: '15px'}}
                >
                    <span
                        className="ant-dropdown-link"
                        style={{padding: '10px', cursor: 'pointer'}}
                    >
                        <Icon
                            style={{padding: '0 4px', fontWeight: 800}}
                            type="global"
                        />
                        企业
                    </span>
                </Link>
                {
                    OEM.Title === '冬笋云'
                    ? <span>
                        <Dropdown
                            overlay={menu1}
                            placement="bottomRight"
                        >
                        <span
                            className="ant-dropdown-link"
                            style={{padding: '10px', cursor: 'pointer'}}
                        >
                            <Icon
                                style={{padding: '0 4px', fontWeight: 800}}
                                type="question-circle"
                            />帮助与文档
                        </span>
                    </Dropdown>
                    <span style={{padding: '0 5px'}}> </span>
                    <a onClick={()=>{
                        window.open('https://freeioe.org/', '_blank')
                    }}
                    >
                        <Icon
                            style={{padding: '0 4px', fontWeight: 800}}
                            type="message"
                        />

                        讨论
                    </a>
                    <span style={{padding: '0 5px'}}> </span>

                    <span style={{padding: '0 5px'}}> </span>
                    <a onClick={()=>{
                        window.open('https://wiki.freeioe.org/', '_blank')
                    }}
                    >
                        <Icon
                            style={{padding: '0 4px', fontWeight: 800}}
                            type="book"
                        />

                        知识库
                    </a>
                    <span style={{padding: '0 5px'}}> </span>
                    </span>

                    : ''
                }
                <Dropdown
                    overlay={menu}
                    placement="bottomRight"
                    style={{marginRight: 20}}
                >
                    <span
                        className="ant-dropdown-link"
                        style={{padding: '10px', cursor: 'pointer'}}
                    >
                        <Icon type="user"/>
                        {
                            decodeURI(_getCookie('full_name').split(' ')[0])
                        }
                    </span>
                </Dropdown>
            </div>
        );
    }
}
export default HeaderBar;