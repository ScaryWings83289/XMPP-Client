import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import { client, xml } from '@xmpp/client';
import debug from '@xmpp/debug';

const base64 = require('base-64');
global.btoa = base64.encode;
global.atob = base64.decode;

const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: '#fff',
        alignItems: 'center',
        padding: '50px',
    },
    button: {
        marginTop: '10px',
        justifyContent: 'center',
        fontSize: '20px',
    },
    buttonText: {
        fontSize: '22px',
        color: '#FFF',
        alignSelf: 'center'
    },
    output_result: {
        color: '#000',
        marginTop: '20px',
        textAlign: 'center',
    }
}));

function App() {
    const classes = useStyles();

    const [output, setOutput] = useState('');

    const xmpp = client({
        service: "ws://localhost:5222",
        domain: "localhost",
        resource: "laptop",
        username: "admin",
        password: "password",
    });

    debug(xmpp, true);

    const onStartConnect = () => {
        xmpp.on("error", (err) => {
            console.log(`An error occured: ${err}`);
        });
    }

    const onSendMessage = () => {
        alert('Send');
        xmpp.on("offline", () => {
            console.log("offline");
        });

        xmpp.on("stanza", async (stanza) => {
            if (stanza.is("message")) {
                await xmpp.send(xml("presence", { type: "unavailable" }));
                await xmpp.stop();
            }
        });
        xmpp.on("online", async (address) => {
            // Makes itself available
            await xmpp.send(xml("presence"));

            // Sends a chat message to itself
            const message = xml(
                "message",
                { type: "chat", to: address },
                xml("body", {}, "hello world"),
            );
            await xmpp.send(message);
        });

        xmpp.start().catch(console.error);
    }

    const buttons = (
        <div className={classes.container}>
            <Button
                type="submit"
                variant="contained"
                color="primary"
                onClick={onStartConnect}
                className={classes.button}
            >
                Connect to XMPP server (login)
            </Button>
            <Button
                type="submit"
                variant="contained"
                color="primary"
                onClick={onSendMessage}
                className={classes.button}
            >
                Send a message
            </Button>
        </div>
    );

    return (
        <div >
            <p
                className={classes.output_result}
            >
                {output}
            </p>
            {buttons}
        </div>
    );
}

export default App;
