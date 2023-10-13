import React, { Component } from 'react';
import { Row, Col, Input, Button, Container, Label, FormGroup } from "reactstrap";

// Redux
import { Link } from 'react-router-dom';


// availity-reactstrap-validation
import { AvForm, AvField } from 'availity-reactstrap-validation';

// import images
import logodark from "../../assets/images/logo-dark.png";
import logolight from "../../assets/images/logo-light.png";
import Surveyimg from "../../assets/images/survey.jpg";

class Login extends Component {

    constructor(props) {
        super(props);
        this.state = {

        }
    }

    componentDidMount() {
        document.body.classList.add("auth-body-bg");
    }

    componentWillUnmount() {
        document.body.classList.remove("auth-body-bg");
    }

    render() {

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
                                                            <Link to="/" className="logo">
                                                                <img src={Surveyimg} height="20" alt="logo" className='logo-dark-element' />
                                                                <img src={Surveyimg} height="20" alt="logo" className='logo-light-element' />
                                                            </Link>
                                                        </div>

                                                        <h4 className="font-size-18 mt-4">Welcome Back !</h4>
                                                        <p className="text-muted">Sign in to continue to Survey.</p>
                                                    </div>

                                                    <div className="p-2 mt-5">
                                                        <AvForm className="form-horizontal" >

                                                            <FormGroup className="auth-form-group-custom mb-4">
                                                                <i className="ri-user-2-line auti-custom-input-icon"></i>
                                                                <Label htmlFor="username">Email</Label>
                                                                <AvField name="username" type="text" className="form-control" id="username" validate={{ email: true, required: true }} placeholder="Enter username" />
                                                            </FormGroup>

                                                            <FormGroup className="auth-form-group-custom mb-4">
                                                                <i className="ri-lock-2-line auti-custom-input-icon"></i>
                                                                <Label htmlFor="userpassword">Password</Label>
                                                                <AvField name="password" type="password" className="form-control" id="userpassword" placeholder="Enter password" />
                                                            </FormGroup>

                                                            <div className="form-check">
                                                                <Input type="checkbox" className="form-check-input" id="customControlInline" />
                                                                <Label className="form-check-label" htmlFor="customControlInline">Remember me</Label>
                                                            </div>

                                                            <div className="mt-4 text-center">
                                                                <Button color="primary" className="w-md waves-effect waves-light" type="submit">Log In</Button>
                                                            </div>

                                                            <div className="mt-4 text-center">
                                                                <Link to="/auth-recoverpw" className="text-muted"><i className="mdi mdi-lock me-1"></i> Forgot your password?</Link>
                                                            </div>
                                                        </AvForm>
                                                    </div>

                                                    <div className="mt-5 text-center">
                                                        <p>Don't have an account ? <Link to="/auth-register" className="fw-medium text-primary"> Register </Link> </p>
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
}

export default Login;

