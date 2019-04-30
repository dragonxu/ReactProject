import React, { PureComponent } from 'react';
import { withRouter } from 'react-router';
import { inject, observer} from 'mobx-react';
import http from '../../utils/Server';
import { Table, Button, Modal, Input, message } from 'antd';
import { exec_result } from '../../utils/Session';
//import GatesStatus from '../../common/GatesStatus';
import './style.scss';
@withRouter
@inject('store') @observer
class MyGatesDevicesOutputs extends PureComponent {
    state = {
        data: [],
        visible: false,
        record: {},
        value: '',
        columns: [{
            title: '类型',
            dataIndex: 'vt',
            width: '100px'
          }, {
            title: '名称',
            dataIndex: 'name'
          }, {
            title: '描述',
            dataIndex: 'desc'
          }, {
            title: '单位',
            render: ()=>{
                return (
                    <span>--</span>
                )
            }
          }, {
            title: '数值',
            dataIndex: 'pv'
          }, {
            title: '时间',
            dataIndex: 'tm'
          }, {
            title: '操作',
            width: '150px',
            render: (record)=>{
                return (
                    <Button onClick={()=>{
                        this.showModal(record)
                    }}
                    >下置</Button>
                )
            }
          }]
    }
    componentDidMount (){
        const data = this.props.outputs;
        data.map((item)=>{
            if (!item.vt){
                item.vt = 'float'
            }
        })
        this.setState({data})
    }
    showModal = (record) => {
        this.setState({
            record,
            visible: true
        });
      }
      inputChange = () => {
        const value = event.target.value
        this.setState({value})
      }
      handleOk = () => {
          console.log(this.props.match.params)
          const { sn } = this.props.match.params;
          const { vsn } = this.props;
          const { record, value } = this.state;
          const id = `send_output/${sn}/${vsn}/${this.state.record.name}/${this.state.value}/${new Date() * 1}`
          console.log(this.state.value)
        http.postToken('/api/gateways_dev_outputs', {
            gateway: sn,
            name: vsn,
            output: record.name,
            prop: 'value',
            value: value,
            id: id
        }).then(res=>{
            if (res.data === id){
                // setTimeout(() => {
                //     http.get(`/api/gateways_exec_result?id=${encodeURIComponent(res.data)}`).then(res=>{
                //         console.log(res)
                //         if (res.ok === true){
                //             message.success('发送成功')
                //         } else {
                //             message.error('发送失败，请重新发送')
                //         }
                //     })
                // }, 1000);
                exec_result(id)
            } else {
                message.error('提交错误')
            }
        })
        this.setState({
          visible: false
        });
      }
      handleCancel = () => {
        this.setState({
          visible: false
        });
      }
    render () {
        const { data } = this.state;
        return (
            <div>
                {/* <GatesStatus /> */}
                <Table
                    bordered
                    columns={this.state.columns}
                    dataSource={data ? data : []}
                />
                <Modal
                    title="数据下置"
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                >
                    <p className="flex">点名：
                        <Input
                            disabled
                            value={this.state.record.name}
                        />
                    </p>
                    <p className="flex">数值：
                        <Input
                            onChange={(value)=>{
                                this.inputChange(value)
                            }}
                        />
                    </p>
                </Modal>
            </div>
        );
    }
}

export default MyGatesDevicesOutputs;