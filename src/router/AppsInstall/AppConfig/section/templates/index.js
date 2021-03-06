import React from 'react'
import {withRouter} from 'react-router-dom';
import './style.scss';
import { Table, Input, InputNumber, Popconfirm, Form, Button, Select } from 'antd';

const EditableContext = React.createContext();

class EditableCell extends React.Component {
  getInput = () => {
    if (this.props.dataIndex === 'version') {
        return <InputNumber />;
    }
    if (this.props.dataIndex === 'id') {
        return <div>
            <Input
                type="hidden"
                ref={node => (this.input = node)}
            />
            <Select
                style={{width: '95%'}}
            >
                {this.props.configStore.templates.map((item)=>{
                    return (
                        <Select.Option
                            key={item.name}
                        >
                            {item.name}
                        </Select.Option>
                    )
                })}
            </Select>
        </div>
    }
    return <Input />;
  };

  renderCell = form => {
    const {
        configStore,
        editing,
        dataIndex,
        title,
        record,
        index,
        children,
        ...restProps
    } = this.props;
    configStore, index;
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item style={{ margin: 0 }}>
            {form && form.getFieldDecorator(dataIndex, {
              rules: [
                {
                  required: true,
                  message: `Please Input ${title}!`
                }
              ],
              initialValue: record[dataIndex]
            })(this.getInput())}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  render () {
    return <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>;
  }
}
@withRouter
class EditorTemplates extends React.Component {
  constructor (props) {
    super(props);
    this.state = { editingKey: '', count: 0 };
    this.columns = [
        {
            title: '名称',
            dataIndex: 'name',
            key: 'template_name',
            editable: true
        }, {
            title: '描述',
            dataIndex: 'description',
            key: 'description',
            editable: true
        }, {
            title: '模板ID',
            dataIndex: 'id',
            key: 'conf_id',
            editable: false
        }, {
            title: '版本',
            key: 'version',
            dataIndex: 'ver',
            editable: true
        }, {
            title: '操作',
            dataIndex: 'operation',
            width: '270px',
            render: (text, record) => {
            const { editingKey } = this.state;
            const editable = this.isEditing(record);
            return editable ? (
                <span>
                <EditableContext.Consumer>
                    {form => (
                    <Button
                        onClick={() => this.save(form, record.key)}
                    >
                        保存
                    </Button>
                    )}
                </EditableContext.Consumer>
                <Popconfirm title="Sure to cancel?"
                    onConfirm={() => this.cancel(record.key)}
                >
                    <Button>取消</Button>
                </Popconfirm>
                </span>
            ) : (
              <div disabled={editingKey !== ''}>
                <Button
                    onClick={()=>{
                      window.open(`/template/${this.props.match.params.app}/${record.id}/${record.ver}`, '_blank')
                    }}
                >
                    查看
                </Button>
                <Button
                    disabled={
                      this.props.configStore.templatesList.filter(item=>item.name === record.id).length > 0
                      ? this.props.configStore.templatesList.filter(item=>item.name === record.id)[0].latest_version === record.ver
                      : true
                    }
                    onClick={()=>{
                      this.updateNew(record.id)
                    }}
                    style={{margin: '0 10px'}}
                >
                  {/* {
                    console.log(this.props.configStore.templatesList.filter(item=>item.name === record.id), record, 'recird,ud')
                  } */}
                    升级最新
                </Button>
                <Popconfirm title="Sure to delete?"
                    onConfirm={()=> this.delete(record.key)}
                >
                  <Button>删除</Button>
                </Popconfirm>
              </div>
            );
            }
      }
    ];
  }


  componentDidMount () {
    const {dataSource} = this.props
    if (dataSource !== undefined) {
        this.setState({count: dataSource.length})
    }
  }
  isEditing = record => record.key === this.state.editingKey;

  cancel = () => {
    this.setState({ editingKey: '' });
  };
  updateNew (id) {
    const newData = [...this.props.dataSource];
    const index = newData.findIndex(item => id === item.id);
    if (index > -1) {
        const item = this.props.configStore.templatesList.filter(item=> item.name === id)[0]
        if (item) {
          const obj = {
            key: newData[index].key,
            id: id,
            name: newData[index].name,
            ver: item.latest_version,
            description: item.description
          }
          newData.splice(index, 1, obj);
          this.props.config.setValue(newData)
        }
    }
  }
  save (form, key) {
    form.validateFields((error, row) => {
      if (error) {
        return;
      }
      const newData = [...this.props.dataSource];
      const index = newData.findIndex(item => key === item.key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row
        });
        this.setState({ data: newData, editingKey: '' }, ()=>{
            this.props.config.setValue(this.props.dataSource)
            this.props.onChange()
        });
      } else {
        newData.push(row);
        this.setState({ data: newData, editingKey: '' }), ()=>{
            this.props.config.setValue(this.props.dataSource)
            this.props.onChange()
        };
      }
    });
  }

  edit (key) {
    this.setState({ editingKey: key });
  }
  delete (key) {
    let newData = [...this.props.dataSource];
    newData = newData.filter(item => item.key !== key)
    this.props.config.setValue(newData)
    this.props.onChange()
  }

  render () {
    const components = {
      body: {
        cell: EditableCell
      }
    };

    const columns = this.columns.map(col => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          dataIndex: col.dataIndex,
          title: col.title,
          configStore: this.props.configStore,
          editing: this.isEditing(record)
        })
      };
    });

    return (
      <EditableContext.Provider value={this.props.form}>
        <Table
            rowKey="key"
            components={components}
            bordered
            pagination={false}
            dataSource={this.props.dataSource}
            columns={columns}
            rowClassName="editable-row"
        />
      </EditableContext.Provider>
    );
  }
}

export default EditorTemplates