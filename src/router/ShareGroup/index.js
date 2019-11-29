import React, { Component } from 'react';
import './index.scss'
import { Row, Col} from 'antd'
import {inject, observer} from 'mobx-react';
import http from '../../utils/Server';
import Edituser from './Edituser';
import Editable from './Editable';
import { _getCookie } from '../../utils/Session';
@inject('store')
@observer
class ShareGroup extends Component {
    constructor (props) {
        super(props)
        this.state = {
            companies_list: [],
            group_list: [],
            activeKey: '',
            company: ''
        }
    }
    componentDidMount () {
        if (_getCookie('is_admin') !== '1') {
            this.props.history.push('/')
            return false;
        }
        this.getData()
    }
    getData = () => {
        http.get('/api/companies_list').then(res=>{
            if (res.ok && res.data.length > 0) {
                this.setState({
                    company: res.data[0]
                })
                http.get('/api/companies_read?name=' + res.data[0]).then(data=>{
                    if (data.ok) {
                        this.setState({
                            companies_list: [data.data]
                        })
                    }
                })
                http.get('/api/companies_sharedgroups_list?company=' + res.data[0]).then(data=>{
                    if (data.ok && data.data.length > 0) {
                        this.setState({
                            group_list: data.data,
                            activeKey: data.data[0].name,
                            group_name: data.data[0].group_name
                        }, ()=>{
                            this.props.store.groups.setGroupsUserlist(data.data[0])
                        })
                    } else {
                        this.setState({
                            group_list: []
                        })
                    }
                })
            }
        })
    }
    setActiveKey = (record) => {
        this.setState({
            activeKey: record.name,
            company: record.company,
            group_name: record.group_name
        })
    }
    render () {
        return (
            <div className="share-group">
                <p className="manage">共享组管理</p>
                <Row>
                    <Col span={6}>
                        <Edituser
                            companies_list={this.state.companies_list}
                            group_list={this.state.group_list}
                            setActiveKey={this.setActiveKey}
                            activeKey={this.state.activeKey}
                            group_name={this.state.group_name}
                            company={this.state.company}
                            getdata={this.getData}
                        />
                    </Col>
                    <Col span={1}/>
                    <Col span={17}>
                        <Editable
                            companies_list={this.state.companies_list}
                            activeKey={this.state.activeKey}
                            company={this.state.company}
                            group_name={this.state.group_name}
                            getdata={this.getData}
                        />
                    </Col>
                </Row>

            </div>
        )
    }
}
export default ShareGroup