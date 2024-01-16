import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
/* import LockOutlinedIcon from "@mui/icons-material/LockOutlined"; */
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Web3 from "web3";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
/* import ethereumjs from "ethereumjs-tx"; */
const web3 = new Web3(window.ethereum /* || "ws://localhost:8545" */);
console.log(web3);
web3.eth.defaultChain = "sepolia";
console.log(web3.eth.defaultChain);
const defaultTheme = createTheme();

export default function MainPage() {
  const [loading, setLoading] = React.useState(false);
  const [signedTransactions, setSignedTransactions] = React.useState(null);
  const [send_address, setSendAddress] = React.useState({
    address: "0x5Dba29C71575F4b271926c98F5170d86FfEb1bab",
    balance: undefined,
  });
  const [receive_address, setReceiveAddress] = React.useState({
    address: "",
    balance: undefined,
  });
  const testFetch = async () => {
    setLoading(true);
    const url = "http://127.0.0.1:5000/";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        receiverAddress: receive_address.address,
        value: 0.0001,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        setSignedTransactions(data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setLoading(false);
      });
  };
  React.useEffect(() => {
    /* testFetch(); */
    fetchData(send_address.address, "send").then((result) => {
      if (isNaN(result)) {
        result = undefined;
      }
      setSendAddress({ address: send_address.address, balance: result });
    });
    return () => {};
  }, []);

  const handleAdressInputChange = (event, who) => {
    event.preventDefault();

    //check event.target.value is a valid address which is 42 characters
    if (event.target.value.length === 42) {
      fetchData(event.target.value, who).then((result) => {
        if (isNaN(result)) {
          result = undefined;
        }
        if (who === "send") {
          console.log("setting send address");
          setSendAddress({ address: event.target.value, balance: result });
        } else {
          setReceiveAddress({ address: event.target.value, balance: result });
        }
      });
    } else {
      if (who === "send") {
        console.log("setting send address");
        setSendAddress({ address: event.target.value, balance: undefined });
      } else {
        setReceiveAddress({ address: event.target.value, balance: undefined });
      }
    }
  };

  const handleSendTransaction = (event) => {
    event.preventDefault();
    setLoading(true);
    if (signedTransactions === null) {
      return;
    }
    console.log(signedTransactions);
    web3.eth
      .sendSignedTransaction(signedTransactions)
      .on("receipt", () => {
        setLoading(false);
        setSignedTransactions(null);
        //refresh the balance
        fetchData(send_address.address, "send").then((result) => {
          if (isNaN(result)) {
            result = undefined;
          }
          setSendAddress({ address: send_address.address, balance: result });
        });
        fetchData(receive_address.address, "receive").then((result) => {
          if (isNaN(result)) {
            result = undefined;
          }
          setReceiveAddress({
            address: receive_address.address,
            balance: result,
          });
        });
      })
      .catch((error) => {
        console.error("Error sending signed transaction:", error);
        setLoading(false);
      });
  };
  const handleSignTransaction = (event) => {
    event.preventDefault();
    if (receive_address.balance === undefined) {
      return;
    }
    testFetch();
  };
  const fetchData = async (addr, who) => {
    try {
      console.log("fetching data", who);
      const url = `https://sepolia.infura.io/v3/20afaf6225ba454ab4ef10b82f76ba0c`;
      const data = {
        jsonrpc: "2.0",
        method: "eth_getBalance",
        params: [addr, "latest"],
        id: 1,
      };
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const resultJson = await response.json();
      /* setResult(resultJson.result); */
      console.log(resultJson.result);
      //hex to decimal
      console.log(parseInt(resultJson.result, 16) / 1000000000000000000);
      return parseInt(resultJson.result, 16) / 1000000000000000000;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" sx={{ mt: 4, mb: 4, width: "100%" }}>
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography component="h1" variant="h5">
            Make a Transaction on Sepolia
          </Typography>
          <Box component="form" noValidate sx={{ mt: 1, width: "70%" }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Sender Address"
              autoFocus
              value={send_address.address}
              disabled
              onChange={(event) => handleAdressInputChange(event, "send")}
            />
            <Typography>
              {send_address.balance !== undefined
                ? `Balance: ${send_address.balance} ETH`
                : "Balance: "}
            </Typography>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Receiver Address"
              id="password"
              autoComplete="current-password"
              onChange={(event) => handleAdressInputChange(event, "receive")}
            />
            <Typography>
              {receive_address.balance !== undefined
                ? `Balance: ${receive_address.balance} ETH`
                : "Balance: "}
            </Typography>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={receive_address.balance === undefined}
              onClick={handleSignTransaction}
            >
              Sign the Transaction
            </Button>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={signedTransactions === null}
              onClick={handleSendTransaction}
            >
              Send 0.0001 ETH to Receiver
            </Button>
          </Box>
        </Box>
      </Container>

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </ThemeProvider>
  );
}
