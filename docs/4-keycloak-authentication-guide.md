# Keycloak Authentication Guide

This document outlines the steps to configure Keycloak authentication for the LiteLLM customer application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Running Keycloak with Docker Compose](#running-keycloak-with-docker-compose)
- [Keycloak Configuration](#keycloak-configuration)
  - [1. Accessing the Keycloak Admin Console](#1-accessing-the-keycloak-admin-console)
  - [2. Creating a New Realm](#2-creating-a-new-realm)
  - [3. Creating a New Client](#3-creating-a-new-client)
  - [4. Configuring the Client](#4-configuring-the-client)
  - [5. Creating a User](#5-creating-a-user)
- [Application Configuration](#application-configuration)
  - [Connecting to a Different Keycloak Instance](#connecting-to-a-different-keycloak-instance)

## Prerequisites

- Docker and Docker Compose installed on your system.

## Running Keycloak with Docker Compose

The provided `docker-compose.yaml` file includes a Keycloak service for local testing. To start all services, including Keycloak, run the following command from the root of the project:

```bash
docker-compose up -d
```

This will start the Keycloak instance, which will be accessible at `http://localhost:8080`.

## Keycloak Configuration

### 1. Accessing the Keycloak Admin Console

- Open your web browser and navigate to `http://localhost:8080`.
- Click on the "Administration Console" link.
- Log in with the default credentials:
  - **Username:** `admin`
  - **Password:** `admin`

### 2. Creating a New Realm

A realm in Keycloak is a space where you manage your users, credentials, roles, and clients.

- From the top-left corner, hover over the "master" realm and click "Add realm".
- Enter `litellm` as the realm name and click "Create".

### 3. Creating a New Client

A client in Keycloak is an entity that can request authentication of a user.

- In the `litellm` realm, navigate to "Clients" from the left-hand menu and click "Create".
- Set the **Client ID** to `litellm-customer`.
- Ensure the **Client Protocol** is `openid-connect`.
- Click "Save".

### 4. Configuring the Client

After creating the client, you need to configure it to work with the LiteLLM customer application.

- **Access Type:** Set this to `confidential`. This is required for the client secret.
- **Valid Redirect URIs:** Add `http://localhost:3000/api/auth/callback/keycloak` to the list of valid redirect URIs. This is the URL that Keycloak will redirect to after a successful login.
- Click "Save".
- Navigate to the "Credentials" tab and copy the **Client Secret**. You will need this for the application configuration.

### 5. Creating a User

- In the `litellm` realm, navigate to "Users" from the left-hand menu and click "Add user".
- Fill in the user details (e.g., username, email, first name, last name).
- Click "Save".
- Navigate to the "Credentials" tab and set a password for the user. Make sure to turn off the "Temporary" switch if you want the password to be permanent.

## Application Configuration

The LiteLLM customer application is configured using environment variables in the `docker-compose.yaml` file.

```yaml
  litellm-customer:
    # ...
    environment:
      # ...
      KEYCLOAK_CLIENT_ID: "litellm-customer"
      KEYCLOAK_CLIENT_SECRET: "YOUR_CLIENT_SECRET" # Replace with the secret from Keycloak
      KEYCLOAK_ISSUER: "http://localhost:8080/realms/litellm"
```

- `KEYCLOAK_CLIENT_ID`: The ID of the client you created in Keycloak.
- `KEYCLOAK_CLIENT_SECRET`: The secret you copied from the client's "Credentials" tab.
- `KEYCLOAK_ISSUER`: The URL of the Keycloak realm.

### Connecting to a Different Keycloak Instance

To connect to a different Keycloak instance (e.g., a production instance), you only need to update the environment variables in your deployment configuration (e.g., `.env` file or `docker-compose.yaml`).

- **`KEYCLOAK_CLIENT_ID`**: The client ID for the application in the new Keycloak instance.
- **`KEYCLOAK_CLIENT_SECRET`**: The client secret for the application in the new Keycloak instance.
- **`KEYCLOAK_ISSUER`**: The issuer URL of the new Keycloak instance (e.g., `https://your-keycloak-domain.com/realms/your-realm`).

By updating these variables, you can easily switch between different Keycloak instances without any code changes, making the application Keycloak-agnostic.