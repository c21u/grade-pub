# Getting Started

You'll need [node.js](https://nodejs.org/en/), [mkcert](https://github.com/FiloSottile/mkcert) and [docker-compose](https://docs.docker.com/compose/install/)

1. Clone this project to your local machine with `git clone git@github.com/c21u/grade-pub.git`
- Make sure the your `node` and `npm` is up to date with latest stable version
2. Install the project dependencies by running `yarn install`
3. Configure SSL certs for the local docker instances
    1. Run `mkcert -install` to install a local CA
    2. Generate SSL certs with `mkcert -cert-file ~/certs/127.0.0.1.nip.io.crt -key-file ~/certs/127.0.0.1.nip.io.key '*.127.0.0.1.nip.io'`
    3. If you're using MacOS or Linux run `echo export NODE_EXTRA_CA_CERTS="\"$(mkcert -CAROOT)/rootCA.pem\"" | tee -a ~/.bash_profile ~/.zshenv && exec $0` to add the local CA to your environment
    4. If you're using Windows
        1. Run `mkcert -CAROOT` and note the path that's returned
        1. On the Windows taskbar, right-click the Windows icon and select `System`
        2. In the Settings window, under `Related Settings`, click `Advanced system settings`
        3. On the Advanced tab, click `Environment Variables`
        4. Click `New` to create a new environment variable
        5. Set the variable name to `NODE_EXTRA_CA_CERTS` and its value to the path you got from running `mkcert -CAROOT` concatenated with `/rootCA.pem`
        6. Click `Apply` and then `OK` to have the change take effect
4. Add configuration to `.env` somthing like the following (adjust for your Canvas configuration)
    ```
    LTI_KEY=dev
    LTI_SECRET=devsecret
    TRUST_PROXY=uniquelocal
    CANVAS_TOKEN=canvas-docker
    ```
5. Build and start the tool using `docker-compose up --build`, if you get an error that a port is in use you're probably already running a web server or db on your machine, you'll have to either stop it or adjust the ports used by this project
6. Install and configure an LTI tool in your canvas instance where the tool launch url is https://dev.127.0.0.1.nip.io and the key and secret match what you set in .env
