
import { useNavigate } from "react-router-dom";
import { Typography, Button, TextField, Grid, Paper, Link, Box, Stack, Alert, Select, InputLabel, FormControl, MenuItem, Autocomplete } from '@mui/material';
import axios from 'axios';
import { useState,useEffect,useRef } from "react";
import { useContext } from "react";
import { UserData } from "../store/user-data";

export const Registration = () => {

   const userCtx= useContext(UserData);

     const navigate = useNavigate();


    let [firstName, setFirstName] = useState("");
    let [lastName, setLastName] = useState("");
    let [password, setPassword] = useState("");
    let [reEnterPassword, setReEnterPassword] = useState("");
    let [email, setEmail] = useState("");

    let [passwordError, setPasswordError] = useState("");

    let [registrationCompleted, setRegistrationCompleted] = useState(false);
    let [emailError, setEmailError] = useState("");
    let [firstNameError, setFirstNameError] = useState("");
    let [lastNameError, setLastNameError] = useState("");


    let [registrationError, setRegistrationError] = useState("");

    const paperStyle = { padding: 20, height: '70vh', width: 280, margin: "20px auto" };
    const spacingStyle = { margin: "0.5rem 0" };


    const changePassword = (event: any) => {
        setPassword(event.target.value);

        if (event.target.value === "" || event.target.value.length < 6) {
            setPasswordError("Password should be at least 6 characters long");
        } else {
            setPasswordError("");
        }

    }

    const changeReEnterPassword = (event: any) => {
        setReEnterPassword(event.target.value);

    }

        const changeEmail = (event: any) => {
        setEmail(event.target.value);
        if (event.target.value === "") {
            setEmailError("Email is required");
        } else {
            setEmailError("");
        }
    };


        const changeFirstName = (event: any) => {
        setFirstName(event.target.value);
        if (event.target.value === "") {
            setFirstNameError("First name is required");
        } else {
            setFirstNameError("");
        }
    };

        const changeLastName = (event: any) => {
        setLastName(event.target.value);
        if (event.target.value === "") {
            setLastNameError("Last name is required");
        } else {
            setLastNameError("");
        }
    };


    const checkRegistration = () => {


        let error = false;

        if (firstName === "") {
            error = true;
            setFirstNameError("First name is required");
        } else {
            setFirstNameError("");
        }

        if (lastName === "") {
            error = true;
            setLastNameError("Last name is required");
        } else {
            setLastNameError("");
        }


    

        if (password === "" || password.length < 6) {
            error = true;
            setPasswordError("Password should be at least 6 characters long");
        } else {
            setPasswordError("");
        }

        if (email === "") {
            error = true;

            setEmailError("Email is required");
        } else {
            setEmailError("");
        }


        if (!error) {

            if (reEnterPassword !== password) {

                setRegistrationError("Passord and confirmation password not matching");

            } else {
                setRegistrationError("");
                doRegistration();
            }

        } else {
            setRegistrationError("Error on fields");
        }


    }

        const doRegistration = async () => {
        console.log("firstName : " + firstName);
        console.log("lastName :" + lastName);
        console.log("email : " + email);
        console.log("password : " + password);
        console.log("reEnter password : " + reEnterPassword);


        let registrationRequest = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password

        };

        axios.post("http://localhost:8081/api/auth/register", registrationRequest)
            .then((response: any) => {
                console.log(response);
                setRegistrationCompleted(true);
                setRegistrationError("");
            })
            .catch((error: any) => {
                console.log("errore nella registrazione");
                console.log(error);
                setRegistrationError("errore generico di validazione");
            });


    }


       return (
        !registrationCompleted ?
            <Grid>{
                registrationError != "" ?
                    <Stack spacing={2}>
                        <Alert severity='error' variant='standard' onClose={() => { setRegistrationError("") }}>{registrationError}</Alert>
                    </Stack> : null
            }

                <Paper elevation={10} style={paperStyle}>
                    <Grid container direction="column" alignItems="center" justifyContent="center">
                        <h2>Create account</h2>
                    </Grid>
                    <TextField label="Email" placeholder="Enter email" fullWidth required style={spacingStyle} value={email} onChange={changeEmail}
                        error={emailError !== ""} helperText={emailError !== "" ? emailError : null} />
                    <TextField label="First Name" placeholder="Enter first name" fullWidth required style={spacingStyle} value={firstName} onChange={changeFirstName}
                        error={firstNameError !== ""} helperText={firstNameError !== "" ? firstNameError : null} />
                    <TextField label="Last Name" placeholder="Enter last name" fullWidth required style={spacingStyle} value={lastName} onChange={changeLastName}
                        error={lastNameError !== ""} helperText={lastNameError !== "" ? lastNameError : null} />
                    <TextField label="Password" placeholder="Enter password" type="password" fullWidth required style={spacingStyle} value={password} onChange={changePassword}
                        error={passwordError !== ""} helperText={passwordError !== "" ? passwordError : null} />
                    <TextField label="Re-enter Password" placeholder="Re-enter password" type="password" fullWidth required style={spacingStyle} value={reEnterPassword} onChange={changeReEnterPassword} />
            
      
                    <Button type="submit" color="primary" fullWidth variant="contained" style={spacingStyle} onClick={checkRegistration}>Sign in</Button>
                    <Typography>Already have an account ?
                        <Link component="button" onClick={() => navigate("/login")}> Sign in
                        </Link>
                    </Typography>
                </Paper>
            </Grid> :

            <Grid>
                <Paper elevation={10} style={paperStyle}>
                    <Typography>
                        La registrazione è avvenuta con successo . E' stata inviata una mail all'indirizzo specificato
                    </Typography>
                </Paper>
            </Grid>
    );


}