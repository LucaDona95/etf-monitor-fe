import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AppContext } from "../App";
import { Typography, Button, TextField, Grid, Paper, Avatar, Link, FormControlLabel, Checkbox, Box, FormControl, FormLabel, FormGroup, Stack, Rating,Alert } from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import axios from 'axios';

export const Login = () => {

    const { setUserData } = useContext(AppContext);

    const navigate = useNavigate();

    let [loginEmail, setLoginEmail] = useState("");
    let [password, setPassword] = useState("");
    let [emailError,setEmailError] = useState("");
    let [passwordError,setPasswordError] = useState("");

    let [loginError, setLoginError] = useState("");


        const changeLoginEmail = (event: any) => {
        setLoginEmail(event.target.value);
       
    };

    const changePassword = (event: any) => {
        setPassword(event.target.value);
        
    }

       const doSignIn = async()=>{
        const loginRequest = {
            email: loginEmail,
            password: password
        };

        console.log(loginRequest);

        axios.post("http://localhost:8081/api/auth/authenticate", loginRequest)
        .then((response:any) => {

            console.log(response);

        let userData={
            userId:response.data.userId,
            jwtToken:response.data.token,
            refreshToken:response.data.refreshToken
        }

            setLoginError(""); 
            setUserData(userData);
            navigate("/");
        })
        .catch((error:any) => {

            console.log("errore con il login");
            console.log(error);
            setLoginError("username or password not correct"); 
        })
    }


        const signIn =  () => {


        let error=false;

        if(loginEmail===""){
            error=true;
            setEmailError("email is required");
        }else{
            setEmailError("");
        }
        
        if(password===""){
            error=true;
            setPasswordError("Password is required");
        }else{
            setPasswordError("");
        }

        if(!error){

            doSignIn();
        }     
    }

    const paperStyle = { padding: 20, height: '70vh', width: 280, margin: "3rem auto" };
    const spacingStyle = { margin: "0.5rem 0" };
    const homeButtonStyle = { margin: "1rem 0", whith: 300 };


     return (

        <Grid>
            {
                loginError != "" ?
                    <Stack spacing={2}>
                        <Alert severity='error' variant='standard' onClose={() => { setLoginError("") }}>{loginError}</Alert>
                    </Stack> : null
            }
            <Paper elevation={10} style={paperStyle}>
                <Grid container direction="column" alignItems="center" justifyContent="center">
                    <Avatar><AccountCircle /></Avatar>
                    <h2>Sign in</h2>
                </Grid>
                <TextField label="Email" placeholder="Enter email" fullWidth required style={spacingStyle} value={loginEmail} onChange={changeLoginEmail} 
                error={emailError!==""} helperText={emailError!==""?"Please enter username":null}/>
                <TextField label="Password" placeholder="Enter password" type="password" fullWidth required style={spacingStyle} value={password} onChange={changePassword} 
                error={passwordError!==""} helperText={passwordError!==""?"Please enter password":null}/>
                <FormControlLabel
                    control={<Checkbox name="checkedB" color="primary" />} label="Remember me"
                ></FormControlLabel>
                <Button type="submit" color="primary" fullWidth variant="contained" style={spacingStyle}
                    onClick={signIn}>Sign in</Button>
                <Typography>
                    <Link component="button" onClick={() => console.log("miao")}>Forgot password ?
                    </Link>
                </Typography>
                <Typography>Do you have an account ?
                    <Link component="button" onClick={() => navigate("/registration")}> Sign up
                    </Link>
                </Typography>
            </Paper>
        </Grid>




    )


    
}