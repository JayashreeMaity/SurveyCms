// import React, { Component } from 'react';

// import { Row, Col, Input, Button, Alert, Container, Label } from "reactstrap";

// // Redux
// import { connect } from 'react-redux';
// import { withRouter, Link } from 'react-router-dom';

// // availity-reactstrap-validation
// import { AvForm, AvField } from 'availity-reactstrap-validation';

// // actions
// import { checkLogin, apiError } from '../../store/actions';

// // import images
// import logodark from "../../assets/images/logo-dark.png";
// import logolight from "../../assets/images/logo-light.png";
// import Audiopitaralogo from "../../assets/images/Audiopitara.png"
// class Login extends Component {

//     constructor(props) {
//         super(props);
//         this.state = { username: "admin@survey.com", password: "123456" }
//         this.handleSubmit = this.handleSubmit.bind(this);
//     }

//     handleSubmit(event, values) {
//         this.props.checkLogin(values, this.props.history);
//     }

//     componentDidMount() {
//         this.props.apiError("");
//         document.body.classList.add("auth-body-bg");
//     }

//     componentWillUnmount() {
//         document.body.classList.remove("auth-body-bg");
//     }

//     render() {

//         return (
//             <React.Fragment>
//                 <div>
//                     <Container fluid className="p-0">
//                         <Row className="g-0">
//                             <Col lg={4}>
//                                 <div className="authentication-page-content p-4 d-flex align-items-center min-vh-100">
//                                     <div className="w-100">
//                                         <Row className="justify-content-center">
//                                             <Col lg={9}>
//                                                 <div>
//                                                     <div className="text-center">
//                                                         <div>
//                                                             <Link to="/" className="">
//                                                                 <img src={Audiopitaralogo} alt="" height="20" className="auth-logo logo-dark mx-auto"  style={{ backgroundColor: "red", height: "60px", fontSize: "40px" }}  />
//                                                                 {/* <img src={logolight} alt="" height="20" className="auth-logo logo-light mx-auto" /> */}
//                                                             </Link>
//                                                         </div>

//                                                         <h4 className="font-size-18 mt-4">Welcome Back !</h4>
//                                                         <p className="text-muted">Sign in to continue to AudioPitara.</p>
//                                                     </div>


//                                                     {this.props.loginError && this.props.loginError ? <Alert color="danger">{this.props.loginError}</Alert> : null}

//                                                     <div className="p-2 mt-5">
//                                                         <AvForm className="form-horizontal" onValidSubmit={this.handleSubmit} >

//                                                             <div className="auth-form-group-custom mb-4">
//                                                                 <i className="ri-user-2-line auti-custom-input-icon"></i>
//                                                                 <Label htmlFor="username">Email</Label>
//                                                                 <AvField name="username" value={this.state.username} type="text" className="form-control" id="username" validate={{ email: true, required: true }} placeholder="Enter username" />
//                                                             </div>

//                                                             <div className="auth-form-group-custom mb-4">
//                                                                 <i className="ri-lock-2-line auti-custom-input-icon"></i>
//                                                                 <Label htmlFor="userpassword">Password</Label>
//                                                                 <AvField name="password" value={this.state.password} type="password" className="form-control" id="userpassword" placeholder="Enter password" />
//                                                             </div>

//                                                             <div className="form-check">
//                                                                 <Input type="checkbox" className="form-check-input" id="customControlInline" />
//                                                                 <Label className="form-check-label" htmlFor="customControlInline">Remember me</Label>
//                                                             </div>

//                                                             <div className="mt-4 text-center">
//                                                                 <Button color="primary" className="w-md waves-effect waves-light" type="submit">Log In</Button>
//                                                             </div>

//                                                             <div className="mt-4 text-center">
//                                                                 <Link to="/forgot-password" className="text-muted"><i className="mdi mdi-lock me-1"></i> Forgot your password?</Link>
//                                                             </div>
//                                                         </AvForm>
//                                                     </div>

//                                                     <div className="mt-5 text-center">
//                                                         <p>Don't have an account ? <Link to="/register" className="fw-medium text-primary"> Register </Link> </p>
//                                                         <p>© 2021 Naxtre. Crafted with <i className="mdi mdi-heart text-danger"></i> by Naxtre</p>
//                                                     </div>
//                                                 </div>

//                                             </Col>
//                                         </Row>
//                                     </div>
//                                 </div>
//                             </Col>
//                             <Col lg={8}>
//                                 <div className="authentication-bg">
//                                     <div className="bg-overlay"></div>
//                                 </div>
//                             </Col>
//                         </Row>
//                     </Container>
//                 </div>
//             </React.Fragment>
//         );
//     }
// }

// const mapStatetoProps = state => {
//     const { loginError } = state.Login;
//     return { loginError };
// }

// export default withRouter(connect(mapStatetoProps, { checkLogin, apiError })(Login));


import React, { useState, useEffect } from 'react';
import { Row, Col, Input, Button, Alert, Container, Label } from "reactstrap";
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import { checkLogin, apiError } from '../../store/actions';
import Audiopitaralogo from "../../assets/images/Audiopitara.png";
import AudioBlack from "../../assets/images/AudioBlack.png";
import Surveyimg from "../../assets/images/survey.jpg";

const Login = (props) => {
    const [username, setUsername] = useState("admin@survey.com");
    const [password, setPassword] = useState("123456");

    const handleSubmit = (event, values) => {
        props.checkLogin(values, props.history);
    }

    useEffect(() => {
        props.apiError("");
        document.body.classList.add("auth-body-bg");

        return () => {
            document.body.classList.remove("auth-body-bg");
        };
    }, []);

    return (
        <React.Fragment>
            <div>
                <Container fluid className="p-0">
                    <Row className="g-0">
                        <Col lg={4}>
                            <div className="authentication-page-content p-4 d-flex align-items-center min-vh-100">
                                <div className="w-100">
                                    <Row className="justify-content-center">
                                        <Col lg={9}>
                                            <div>
                                                <div className="text-center">
                                                    <div>
                                                        <Link to="/" className="">
                                                            <img src={Surveyimg} alt=""  className="auth-logo logo-dark mx-auto" style={{height: "5rem" }} />
                                                        </Link>
                                                    </div>

                                                    <h4 className="font-size-18 mt-4">Welcome Back !</h4>
                                                    <p className="text-muted">Sign in to continue to Survey.</p>
                                                </div>

                                                {props.loginError && props.loginError ? <Alert color="danger">{props.loginError}</Alert> : null}

                                                <div className="p-2 mt-5">
                                                    <AvForm className="form-horizontal" onValidSubmit={handleSubmit} >

                                                        <div className="auth-form-group-custom mb-4">
                                                            <i className="ri-user-2-line auti-custom-input-icon"></i>
                                                            <Label htmlFor="username">User Name</Label>
                                                            <AvField name="username" value={username} type="text" className="form-control" id="username" validate={{ email: true, required: true }} placeholder="Enter username" onChange={(e) => setUsername(e.target.value)} />
                                                        </div>

                                                        <div className="auth-form-group-custom mb-4">
                                                            <i className="ri-lock-2-line auti-custom-input-icon"></i>
                                                            <Label htmlFor="userpassword">Password</Label>
                                                            <AvField name="password" value={password} type="password" className="form-control" id="userpassword" placeholder="Enter password" onChange={(e) => setPassword(e.target.value)} />
                                                        </div>

                                                        <div className="form-check">
                                                            <Input type="checkbox" className="form-check-input" id="customControlInline" />
                                                            <Label className="form-check-label" htmlFor="customControlInline">Remember me</Label>
                                                        </div>

                                                        <div className="mt-4 text-center">
                                                            <Button color="primary" className="w-md waves-effect waves-light" type="submit">Log In</Button>
                                                        </div>

                                                        <div className="mt-4 text-center">
                                                            <Link to="/forgot-password" className="text-muted"><i className="mdi mdi-lock me-1"></i> Forgot your password?</Link>
                                                        </div>
                                                    </AvForm>
                                                </div>

                                                <div className="mt-5 text-center">
                                                    <p>Don't have an account ? <Link to="/register" className="fw-medium text-primary"> Register </Link> </p>
                                                    <p>© 2021 Naxtre. Crafted with <i className="mdi mdi-heart text-danger"></i> by Naxtre</p>
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            </div>
                        </Col>
                        <Col lg={8}>
                            <div className="authentication-bg">
                                <div className="bg-overlay"></div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
}

const mapStatetoProps = state => {
    const { loginError } = state.Login;
    return { loginError };
}

export default withRouter(connect(mapStatetoProps, { checkLogin, apiError })(Login));

// import React, { useState, useEffect } from 'react';
// import { Row, Col, Input, Button, Alert, Container, Label } from "reactstrap";
// import { connect } from 'react-redux';
// import { withRouter, Link } from 'react-router-dom';
// import { AvForm, AvField } from 'availity-reactstrap-validation';
// import { checkLogin, apiError } from '../../store/actions';
// import Audiopitaralogo from "../../assets/images/Audiopitara.png";
// import AudioBlack from "../../assets/images/AudioBlack.png";

// const Login = (props) => {
//     const [username, setUsername] = useState("");
//     const [password, setPassword] = useState("");

//     const handleSubmit = (event, values) => {
//         event.preventDefault(); // Prevent the default form submission behavior
//         // Make an API request to authenticate the user
//         fetch('http://3.6.200.239:8000/api/users/login', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ username, password }),
//         })
//         .then(response => {
//             if (response.ok) {
//                 // Handle successful login, e.g., store user information in Redux
//                 props.checkLogin(values, props.history);
//             } else {
//                 // Handle failed login, e.g., display an error message
//                 props.apiError("Login failed. Please check your credentials.");
//             }
//         })
//         .catch(error => {
//             console.error('Error logging in:', error);
//             props.apiError("An error occurred while logging in.");
//         });
//     }

//     useEffect(() => {
//         props.apiError("");
//         document.body.classList.add("auth-body-bg");

//         return () => {
//             document.body.classList.remove("auth-body-bg");
//         };
//     }, []);

//     return (
//         <React.Fragment>
//             <div>
//                 <Container fluid className="p-0">
//                     <Row className="g-0">
//                         <Col lg={4}>
//                             <div className="authentication-page-content p-4 d-flex align-items-center min-vh-100">
//                                 <div className="w-100">
//                                     <Row className="justify-content-center">
//                                         <Col lg={9}>
//                                             <div>
//                                                 <div className="text-center">
//                                                     <div>
//                                                         <Link to="/" className="">
//                                                             <img src={AudioBlack} alt="" height="20" className="auth-logo logo-dark mx-auto" style={{ height:"9rem", marginBottom:"-3rem" }} />
//                                                         </Link>
//                                                     </div>

//                                                     <h4 className="font-size-18 mt-4">Welcome Back !</h4>
//                                                     <p className="text-muted">Sign in to continue to AudioPitara.</p>
//                                                 </div>

//                                                 {props.loginError && props.loginError ? <Alert color="danger">{props.loginError}</Alert> : null}

//                                                 <div className="p-2 mt-5">
//                                                     <AvForm className="form-horizontal" onValidSubmit={handleSubmit} >

//                                                         <div className="auth-form-group-custom mb-4">
//                                                             <i className="ri-user-2-line auti-custom-input-icon"></i>
//                                                             <Label htmlFor="username">Email</Label>
//                                                             <AvField name="username" value={username} type="text" className="form-control" id="username" validate={{ email: true, required: true }} placeholder="Enter username" onChange={(e) => setUsername(e.target.value)} />
//                                                         </div>

//                                                         <div className="auth-form-group-custom mb-4">
//                                                             <i className="ri-lock-2-line auti-custom-input-icon"></i>
//                                                             <Label htmlFor="userpassword">Password</Label>
//                                                             <AvField name="password" value={password} type="password" className="form-control" id="userpassword" placeholder="Enter password" onChange={(e) => setPassword(e.target.value)} />
//                                                         </div>

//                                                         <div className="form-check">
//                                                             <Input type="checkbox" className="form-check-input" id="customControlInline" />
//                                                             <Label className="form-check-label" htmlFor="customControlInline">Remember me</Label>
//                                                         </div>

//                                                         <div className="mt-4 text-center">
//                                                             <Button color="primary" className="w-md waves-effect waves-light" type="submit">Log In</Button>
//                                                         </div>

//                                                         <div className="mt-4 text-center">
//                                                             <Link to="/forgot-password" className="text-muted"><i className="mdi mdi-lock me-1"></i> Forgot your password?</Link>
//                                                         </div>
//                                                     </AvForm>
//                                                 </div>

//                                                 <div className="mt-5 text-center">
//                                                     <p>Don't have an account ? <Link to="/register" className="fw-medium text-primary"> Register </Link> </p>
//                                                     <p>© 2021 Naxtre. Crafted with <i className="mdi mdi-heart text-danger"></i> by Naxtre</p>
//                                                 </div>
//                                             </div>
//                                         </Col>
//                                     </Row>
//                                 </div>
//                             </div>
//                         </Col>
//                         <Col lg={8}>
//                             <div className="authentication-bg">
//                                 <div className="bg-overlay"></div>
//                             </div>
//                         </Col>
//                     </Row>
//                 </Container>
//             </div>
//         </React.Fragment>
//     );
// }

// const mapStatetoProps = state => {
//     const { loginError } = state.Login;
//     return { loginError };
// }

// export default withRouter(connect(mapStatetoProps, { checkLogin, apiError })(Login));
