import React, { Component } from 'react';
import http from '../../../utils/Server';
import { Table, Tabs  } from 'antd';
import { withRouter} from 'react-router-dom';
const TabPane = Tabs.TabPane;

function callback (key) {
  this.setState({
      loading: true,
      activeKey: key
  }, ()=>{
      this.fetch()
  })
}
@withRouter
class GatewayOnlineRecord extends Component {
    constructor (props) {
        super(props)
        this.state = {
            gate_wanip: [],
            // gate_status: [],
            gate_ipchange: [],
            gate_fault: [],
            loading: true,
            gateway: undefined,
            activeKey: 'gate_wanip',
            columns: [{
                title: '时间',
                dataIndex: 'timer',
                key: 'timer',
                width: 300
            }, {
                title: '数值',
                dataIndex: 'number',
                key: 'number'
            }]
        }
        this.callback = callback.bind(this)
    }
    componentDidMount () {
        this.setState({ loading: true, gateway: this.props.gateway }, ()=>{
            this.fetch()
        })
    }
    UNSAFE_componentWillReceiveProps (nextProps){
        if (nextProps.gateway !== this.state.gateway){
            this.setState({
                loading: true,
                gateway: nextProps.gateway
            }, ()=>{
                this.fetch()
            })
        }
    }
    fetch = () => {
        const {gateway, activeKey} = this.state;
        if (gateway === undefined || gateway === '') {
            return
        }
        http.get('/api/gateway_online_record?sn=' + gateway + '&type=' + activeKey).then(res=>{
            if (res.ok) {
                const data = [];
                res.data && res.data.length > 0 && res.data.map(item=>{
                    data.push({
                        timer: new Date(item[0]),
                        number: item[1]
                    })
                })
                this.setState({
                    [activeKey]: data,
                    loading: false
                })
            } else {
                this.setState({
                    [activeKey]: [],
                    loading: false
                })
            }
        })
    }
    render () {
        const { gate_fault, gate_ipchange, gate_wanip, loading, columns } = this.state;
        return (
            <div
                style={{marginTop: 20}}
            >
                <Tabs
                    onChange={this.callback}
                    type="card"
                >
                    <TabPane
                        tab="联网IP记录"
                        key="gate_wanip"
                    >
                        <Table
                            columns={columns}
                            loading={loading}
                            rowKey="timer"
                            dataSource={gate_wanip}
                        />
                    </TabPane>
                    <TabPane
                        tab="网关重连记录"
                        key="gate_fault"
                    >
                        <Table
                            columns={columns}
                            loading={loading}
                            rowKey="timer"
                            dataSource={gate_fault}
                        />
                    </TabPane>
                    <TabPane
                        tab="IP变化记录"
                        key="gate_ipchange"
                    >
                        <Table
                            columns={columns}
                            loading={loading}
                            rowKey="timer"
                            dataSource={gate_ipchange}
                        />
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}

export default GatewayOnlineRecord;