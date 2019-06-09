import React, { Component } from 'react';
import { Input, Table, Select, Button, Icon } from 'antd';
import { inject, observer } from 'mobx-react';
import Status from '../../common/status';
import axios from 'axios';
import './style.scss';
const Option = Select.Option;
const Search = Input.Search;
const columns = [{
    title: '名称',
    dataIndex: 'name',
    sorter: (a, b) => a.name.localeCompare(b.name),
    render: name => `${name}`,
    width: '50%'
  }, {
    title: '描述',
    dataIndex: 'desc'
  }];

  const detailcolumns = [{
    title: '序号',
    dataIndex: 'id',
    sorter: (a, b) => a.id - b.id,
    width: '100px'
  }, {
    title: '类型',
    dataIndex: 'type',
    width: '150px'
  }, {
    title: '数值',
    dataIndex: 'value',
    width: '200px',
    render (text) {
      return (<span title={text}>{text}</span>)
    }
  }, {
    title: '时间',
    dataIndex: 'time'
  }, {
    title: '质量戳',
    dataIndex: 'quality'
  }];


@inject('store')
@observer
class BrowsingHistory extends Component {
    state = {
        data: [],
        filterdata: [],
        pagination: {},
        loading: false,
        detailloading: false,
        rowid: -1,
        detail: [],
        defaultvalue: '--',
        way: 'raw',
        domain: '5m',
        scope: '1h',
        vt: '',
        record: {},
        gateway: '',
        device_sn: ''
      };
      componentDidMount () {
        this.setState({gateway: this.props.match.params.sn, device_sn: this.props.match.params.vsn}, () =>{
          this.fetch();
        })
        this.props.store.timer.setGateStatusLast(0)
        console.log(this)
      }
      UNSAFE_componentWillReceiveProps (nextProps){
          if (this.props.match.params.sn !== nextProps.match.params.sn){
            this.setState({gateway: this.props.match.params.sn, device_sn: this.props.match.params.vsn}, () =>{
              this.fetch();
            })
            this.props.store.timer.setGateStatusLast(0)
          }
      }
      handleTableChange = (pagination, filters, sorter) => {
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        this.setState({
          pagination: pager
        });
        this.fetch({
          results: pagination.pageSize,
          page: pagination.current,
          sortField: sorter.field,
          sortOrder: sorter.order,
          ...filters
        });
      }
      fetch = (params = {}) => {
        console.log('params:', params);
        this.setState({ loading: true });
        axios({
          url: `/api/gateways_dev_data?gateway=${this.state.gateway}&name=${this.state.device_sn}&_=${new Date() * 1}`,
          method: 'get',
          data: {
            results: 10,
            ...params
          },
          type: 'json'
        }).then((resp) => {
          let res = resp.data;
          console.log(res)
          if (!res.ok) {
            return
          }
          res.data.map((val, ind)=>{
              val.id = ind;
          })
          const pagination = { ...this.state.pagination };
          // Read total count from server
          pagination.total = res.totalCount;
          // pagination.total = 200;
          this.setState({
            loading: false,
            data: res.data,
            filterdata: res.data,
            pagination
          }, ()=>{
            console.log(this.state)
          });
        });
      }
      getData = (record)=>{
        const { way, scope, domain} = this.state;
        this.setState({
          rowId: record.id,
          vt: record.vt,
          defaultvalue: this.state.data[record.id].name,
          detailloading: true,
          record: record
        }, ()=>{
          if (record.vt === 'int'){
            record.vt = 'int';
          } else if (record.vt === 'string'){
            record.vt = 'string';
          } else {
            record.vt = 'float';
          }
            axios(`/api/gateways_historical_data?sn=${this.props.match.params.sn}&vsn=${this.props.match.params.vsn}&tag=${record.name}&vt=${record.vt || 'float'}&time_condition=time > now() - ${scope}&value_method=${way}&group_time_span=${domain}&_=1551251898530`, {
              method: 'get',
              headers: {
                  Accept: 'application/json, text/javascript, */*; q=0.01'
              }
            }).then(resp=>{
                let res = resp.data
                if (!res.ok) {
                  return
                }
                if (res.data !== undefined){
                  res.data.map((val, ind)=>{
                    val.id = ind + 1;
                    val.type = this.state.way;
                  })
                  this.setState({
                      detail: res.data,
                      detailloading: false
                  })
                } else {
                  this.setState({
                    detail: [],
                    detailloading: false
                })
                }
            })
        });
      }
      onClickRow = (record) => {
        return {
            onClick: () => {
              this.getData(record)
            }
          };
      }
      setRowClassName = (record) => {
        return record.id === this.state.rowId ? 'clickRowStyl' : '';
      }
      handleChange (type, value) {
        console.log(value)
        switch (type){
          case 'way':
              this.setState({way: value}, ()=>{
                if (Object.keys(this.state.record).length > 0) {
                  this.getData(this.state.record)
                }
              });
              break;
          case 'domain':
              this.setState({domain: value}, ()=>{
                if (Object.keys(this.state.record).length > 0) {
                  this.getData(this.state.record)
                }
              });
              break;
          case 'scope':
              this.setState({scope: value}, ()=>{
                if (Object.keys(this.state.record).length > 0) {
                  this.getData(this.state.record)
                }
              });
              break;
          default: '';
        }
      }
      searchVariable = (e) =>{
        const events = event || e;
        if (this.state.filterdata && this.state.filterdata.length > 0){
          let value = events.target.value;
          let data = this.state.filterdata.filter((item)=>item.name.indexOf(value) !== -1)
          this.setState({
            data
          })
        }
      }
    render () {
        return (
            <div className="historywrap">
                <Status gateway={this.state.gateway}/>
                <div className="history">
                    <div className="historyleft">
                        <div style={{display: 'flex'}}>
                            选中变量：
                            <Input disabled
                                value={this.state.defaultvalue}
                                style={{width: 300}}
                            />
                        </div>
                        <div>
                        <Search
                            placeholder="input search text"
                            onSearch={this.searchVariable}
                            style={{ width: 200 }}
                        />
                        </div>
                        <Table
                            columns={columns}
                            size="middle"
                            rowKey="id"
                            bordered
                            dataSource={this.state.data}
                            pagination={this.state.pagination}
                            loading={this.state.loading}
                            onRow={this.onClickRow}
                            rowClassName={this.setRowClassName}
                            onChange={this.handleTableChange}
                        />
                    </div>
                    <div className="historyright">
                        <Button
                            style={{position: 'absolute', right: 20, top: 5}}
                            onClick={()=>{
                              this.props.history.go(-1)
                            }}
                        >
                          后退
                          <Icon type="rollback"/>
                        </Button>
                        <div>
                          取值方式：
                            <Select defaultValue="raw"
                                disabled={this.state.vt === 'string'}
                                style={{ width: 120 }}
                                onChange={(value)=>{
                                  this.handleChange('way', value)
                                }}
                            >
                              <Option value="raw">原始值</Option>
                              <Option value="mean">平均值</Option>
                              <Option value="max">最大值</Option>
                              <Option value="min">最小值</Option>
                              <Option value="sum">总和</Option>
                              <Option value="count">个数</Option>
                            </Select>
                          统计时域：
                            <Select defaultValue="5m"
                                style={{ width: 120 }}
                                disabled={this.state.way === 'raw' ? true : false}
                                onChange={(value)=>{
                              this.handleChange('domain', value)
                            }}
                            >
                              <Option value="5m">5m</Option>
                              <Option value="10m">10m</Option>
                              <Option value="1h">1h</Option>
                              <Option value="2h">2h</Option>
                              <Option value="6h">6h</Option>
                              <Option value="1d">1d</Option>
                            </Select>
                          时间范围：
                          <Select defaultValue="1h"
                              style={{ width: 120 }}
                              onChange={(value)=>{
                            this.handleChange('scope', value)
                          }}
                          >
                              <Option value="15m">15m</Option>
                              <Option value="30m">30m</Option>
                              <Option value="1h">1h</Option>
                              <Option value="2h">2h</Option>
                              <Option value="12h">12h</Option>
                              <Option value="1d">1d</Option>
                              <Option value="3d">3d</Option>
                              <Option value="7d">7d</Option>
                            </Select>
                        </div>
                        <Table
                            columns={detailcolumns}
                            dataSource={this.state.detail && this.state.detail.length > 0 ? this.state.detail : []}
                            size="small"
                            rowKey="id"
                            bordered
                            loading={this.state.detailloading}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default BrowsingHistory;