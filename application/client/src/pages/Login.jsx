import * as React from 'react'
import { useState, useEffect, useContext } from 'react'
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import axios from 'axios'
import UserContext from '../context'
import '../styles/forgotPassword.css';


export default function Login() {

  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-75%',
      transform: 'translate(-50%, -50%)',
      height: 'clamp(400px, 80vh, 600px)',
      width: 'clamp(400px, 80vw, 600px)',
      backgroundColor: 'rgb(51, 51, 51)',
      borderRadius: '20px',
      zIndex: 999,
    },
  };

  let subtitle;
  const [modalIsOpen, setIsOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");

  function openModal() {
    setIsOpen(true);
  }

  function afterOpenModal() {
    // references are now sync'd and can be accessed.
    subtitle.style.color = '#f00';
  }

  function closeModal() {
    setIsOpen(false);
  }

  const handleReset = async () => {

    const res = await axios.post('/sendEmail/password', { email: emailInput });
    closeModal();

  };

  const handleEmailInputChange = (e) => {
    setEmailInput(e.target.value);
  }



  const { setUser } = useContext(UserContext)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })

  const handleChange = (e) => {
    let obj = {
      ...formData,
    }

    obj[e.target.name] = e.target.value
    setFormData(obj)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!formData.username) {
      setErr('Username field is required')
      return
    }

    if (!formData.password) {
      setErr('Password field is required')
      return
    }

    try {
      const res = await axios.post('/auth/login', formData)
      if (res && res.data && res.data.success) {
        setUser({
          // the user data is passed from the auth controller on the backend
          id: res.data.id,
          username: res.data.username,
          isDriver: res.data.isDriver,
          isRestaurantOwner: res.data.isRestaurantOwner,
          email: res.data.email,
        })

        navigate('/')
      }
    } catch (err) {
      console.error('Error:', err)
      setErr(
        err.response ? err.response.data : 'An error occurred during login.',
      )
    }
  }

  //error display

  const [err, setErr] = useState(null)

  useEffect(() => {
    if (err) {
      const timerId = setTimeout(() => {
        setErr(null)
      }, 3000)
      return () => clearTimeout(timerId)
    }
  }, [err])

  return (
    <Grid container component="main" sx={{ height: '90vh' }}>
      <Grid
        item
        xs={false}
        sm={4}
        md={7}
        sx={{
          backgroundImage: `url(${process.env.PUBLIC_URL}/images/brand/banner.jpg)`, //Change later
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <Box
          sx={{
            my: 10,
            mx: 10,
            display: 'relative',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5" fontSize={40} align="center" marginBottom={10} marginTop={10}>
            Sign in
          </Typography>

          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ mt: 1 }}
          >
            <TextField
              value={formData.name}
              onChange={(e) => handleChange(e)}
              autoComplete="given-name"
              name="username"
              label="Username"
              required
              fullWidth
              autoFocus
              InputLabelProps={{
                sx: {
                  fontSize: '1.2rem',
                },
              }}
              inputProps={{
                style: {
                  fontSize: '2rem',
                },
              }}
              sx={{ marginBottom: '2rem' }}
            />
            <TextField
              value={formData.name}
              onChange={(e) => handleChange(e)}
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              InputLabelProps={{
                sx: {
                  fontSize: '1.2rem',
                },
              }}
              inputProps={{
                style: {
                  fontSize: '2rem',
                },
              }}
            />

            <Grid container justifyContent="space-between" marginBottom={10} marginTop={1} marginLeft={1}  >
              <Grid item marginRight={1} marginTop={2}>
                <label>
                  <input type="checkbox" style={{ transform: 'scale(1.5)', marginRight: '8px' }} />
                  <Link sx={{ color: 'black', fontSize: '2.2rem', textDecoration: 'none', cursor: 'pointer' }}>Remember Me </Link>
                </label>
              </Grid>
              <Grid item marginRight={1} marginTop={2}>
                <Link onClick={openModal} sx={{ color: 'black', fontSize: '2.2rem', cursor: 'pointer' }}>Forgot Password?</Link>
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3, mb: 2, borderRadius: '15px', fontSize: 20,
                backgroundColor: '#FFCF01', color: '#000000',
                width: '250px',
                '&:hover': { backgroundColor: '#fc3' },
                boxShadow: '2px 2px 5px rgba(0, 0, 0, 10)',
                display: 'block',
                margin: '50px auto 50px',

              }}
            >
              Sign In
            </Button>

            <Grid container>
              <Grid item>
                <Link href="/register" variant="body2" sx={{ fontSize: 20, color: 'black' }}>
                  {"Don't have an account? Sign Up here"}
                </Link>
              </Grid>
            </Grid>

            <Modal
              isOpen={modalIsOpen}
              onAfterOpen={afterOpenModal}
              onRequestClose={closeModal}
              style={customStyles}
              contentLabel="Example Modal"
            >
              <div className='forgot-password-container'>
                <div className='fp-header'>
                  <h1>Forgot your password</h1>
                  <Button
                    onClick={closeModal}
                    sx={{
                      backgroundColor: "transparent",
                      border: "none",
                      color: "white",
                      cursor: "pointer",
                      fontSize: "2rem",
                      position: "absolute",
                      right: "0",
                      top: "0",
                      margin: "1rem",
                    }}
                  >
                    X
                  </Button>
                </div>
                <div className='fp-text'>
                  <h2> To receive a new password, please provide your email address. </h2>
                  <h2> Enter email address</h2>
                </div>
                <input className='fp-input' onChange={handleEmailInputChange} type='text' value={emailInput} />


                <Button
                  onClick={handleReset}
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 3, mb: 2, borderRadius: '15px', fontSize: 20,
                    backgroundColor: '#FFCF01', color: '#000000',
                    width: '250px',
                    '&:hover': { backgroundColor: '#fc3' },
                    boxShadow: '2px 2px 5px rgba(0, 0, 0, 10)',
                    display: 'block',
                    margin: '50px auto 50px',
                  }}
                >
                  Reset Password
                </Button>

              </div>
            </Modal>

            {err && (
              <p
                style={{ fontSize: '20px', color: 'red', textAlign: 'center', marginTop: '25px' }}
              >
                {err}
              </p>
            )}
          </Box>
        </Box>
      </Grid>
    </Grid>
  )
}
