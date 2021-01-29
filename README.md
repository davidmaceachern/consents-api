<h1 align="center">
   Consents API
</h1>

<div align="center">
  <!-- <a alt="GitHub Workflow Status" href="https://github.com/davidmaceachern/consents/actions">
    <img  src="https://img.shields.io/github/workflow/status/davidmaceachern/consents/CI">
  </a>
  <a alt="Code Coverage" href="https://codecov.io/gh/davidmaceachern/consents#">
    <img alt="Codecov" src="https://img.shields.io/codecov/c/github/davidmaceachern/consents">
  </a> -->
</div>
<br />

## Prerequisites
  
- [Docker](https://www.docker.com/)
- [Nodejs](https://nodejs.org/en/), or manage multiple versions of Node using [NVM](https://github.com/nvm-sh/nvm)
- A text editor of your choice.
- Clone/download the repository.

## Goals
- This project was developed to address the requirements defined in a Didomi challenge located [here](https://github.com/didomi/challenges/blob/96612679c628b1d3a8be742a193bc3ab78dd7aa2/backend/README.md)

## Data Model

The entity-relationship diagram that represents the data model for this exercise is:

![alt](https://github.com/davidmaceachern/consents-api/blob/04558feebdf899f827d3352e1d7e2b0994211340/diagrams/entity-relationship.png)

## System Architecture

Overview of the technical components. 

![alt](https://github.com/davidmaceachern/consents-api/blob/9bdae952f22b5d2216c25af480ec36669390b3ab/diagrams/system-architecture.png)



## Running the API

1. Open a terminal window
2. Change directory to the root of the Node.js project `cd ./consents/`.
3. Run the server `ENVIRONMENT=DEVELOPMENT npm run start`.

The API will be listening for requests at `http://localhost:3000/api/v1`.

You can view Swagger documentation by visiting `http://localhost:3000/api` in your browser.

## Running Unit Tests

1. Open a terminal window
2. Change directory to the root of the Node.js project `cd ./consents/`.
3. Run the unit tests `npm run test` or `npm run test:watch` to have continuous feedback.

## Running E2E Tests

1. Open a terminal window.
2. Run an instance of the Postgres database locally using the script found [here](https://github.com/davidmaceachern/consents-api/blob/31a108e611d5e15c2579f41d0713f7b29b2eadb4/start-postgres-tmpfs.sh)
3. Open another terminal window
4. Change directory to the root of the Node.js project `cd ./consents/`.
5. Run the e2e tests `npm run test:e2e` or `npm run test:e2eWatch` to have continuous feedback.

## Project Structure

```
├── CHALLENGE.md                        <------ The requirements specification this project is based on.
├── CHANGELOG.MD                        <------ Pull request notes may be added here.
├── README.md                           <------ Overall details about this project.
├── consents                            <------ The Node.js project files are in here.
│   ├── nest-cli.json
│   ├── package-lock.json
│   ├── package.json                    <------ Node.js project metadata and dependency management.
│   ├── src
│   │   ├── app.controller.spec.ts      <------ App-level functionality
│   │   ├── app.controller.ts              |
│   │   ├── app.module.ts                  |
│   │   ├── app.service.ts              <--|
│   │   ├── events                      <------ Event entity functionality.
│   │   ├── main.ts
│   │   └── users                       <------ User entity functionality.
│   ├── test
│   │   ├── app.e2e-spec.ts             <------ Testing the application from a User perspective.
│   │   └── jest-e2e.json
│   ├── tsconfig.build.json
│   └── tsconfig.json
├── diagrams                            <------ Diagrams used to visualize the project.
│   ├── design.drawio                   <------ Drawings that to work through the specification.
│   ├── entity-relationship.png         <------ The data model that was implemented. 
│   ├── system-architecture.png         <------ What the application consists of technically.
└── start-postgres-tmpfs.sh
```

## Generating Docs

Swagger documentation can be accessed after running `npm run start` and visiting `http://localhost:3000/api` in a browser.

## Cleaning Up

Delete dangling resources `docker system prune` or all containers/images/builds `docker system prune -a`, **WARNING** this will delete any Docker resources on your machine. 

## Future Work

- Add decoupled event emitter functionality to address the remaining failing test cases.
- Run a memory profiling tool as described [here](https://www.toptal.com/nodejs/debugging-memory-leaks-node-js-applications), to identify opportunities for optimization.
- Consider whether further decoupling would be beneficial, i.e. do we need to consider another Topic subscription service and task/queue outside of the container process.
- Refactor some of the code for increased readability, adding a data factory for generating entity record test data.
- Add Logging, Telemetry, and Metrics using the standard that the organization has decided on.
- Move the Data transformations into the respective `Dto`.

// TODO Edgecase - if user updates their consent status directly would that emit an event we need to handle here?
// TODO Edgecase - if user is not a valid user, we would need to use an authentication layer to avoid this being a problem?
