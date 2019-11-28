import React, { PureComponent } from 'react';
import { Route, Switch, Redirect, withRouter } from 'react-router-dom';
import { isAuthenticated } from '../../utils/Session';
import './login.scss'
import Background from '../../assets/images/background.png';
import Sign from './sign'
import Register from './register'
import Retrieve from './retrieve'
import Password from './password'
import OEM from '../../assets/OEM';

const sectionStyle = {
    posation: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundImage: `url(${Background})`,
    backgroundSize: '100% 100%'
};
@withRouter
class Login extends PureComponent {

    componentDidMount () {
        if (isAuthenticated()){
            this.props.history.push('/')
        }
    }
    render () {
        const { path } = this.props.match;
        return (
            <div className="login"
                style={sectionStyle}
            >
                <div className="header">
                    <p>
                        <img src=""
                            alt=""
                        />
                        <span>{OEM.Title}</span>
                    </p>
                </div>
                <div className="main">
                    <div className="tabs">
                        <Switch>
                            <Route path={`${path}/sign`}
                                component={Sign}
                                exact
                            />
                            <Route path={`${path}/register`}
                                component={Register}
                                exact
                            />
                            <Route path={`${path}/retrieve`}
                                component={Retrieve}
                                exact
                            />
                            <Route path={`${path}/password`}
                                component={Password}
                                exact
                            />
                            <Redirect
                                from={'/login'}
                                to={`${path}/sign`}
                            />
                        </Switch>
                    </div>
                </div>
                <div className="footer">
                    {OEM.Companies} 版权所有 2018 京ICP备18043454号
                </div>
            </div>
        );
    }
}
export default Login;