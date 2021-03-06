import {AppBar, Box, Toolbar} from "@mui/material";
import Typography from "@mui/material/Typography";
import {useNavigate} from "react-router-dom";
import './Home_and_frame.css'

// Reusable banner for each new page
export default function Banner() {
    const navigate = useNavigate();

    return (
        <Box sx={{flexGrow: 1}}>
            <AppBar position="static" style={{background: '#000000'}}>
                <Toolbar>
                    <Typography variant="h3" component="div" sx={{flexGrow: 1}}>
                        Phoeg Web UI
                    </Typography>
                    <a onClick={() => (navigate("/home", {replace: true}))} >
                        <img src={"logo.png"} height={75} alt="logo" className="link" />
                    </a>
                </Toolbar>
            </AppBar>
        </Box>
    )
}