<h1 align="center">
   Consents API
</h1>

<div align="center">
  <!-- <a alt="GitHub Workflow Status" href="https://github.com/davidmaceachern/consents/actions">
    <img  src="https://img.shields.io/github/workflow/status/davidmaceachern/consents/CI">
  </a> -->
  <!-- <a alt="Code Coverage" href="https://codecov.io/gh/davidmaceachern/consents#">
    <img alt="Codecov" src="https://img.shields.io/codecov/c/github/davidmaceachern/consents">
  </a> -->
</div>
<br />

## Prerequisites
  
- [Docker](https://www.docker.com/), for running Postgres database locally.
- [Nodejs](https://nodejs.org/en/), tested using version `12.20.1` but earlier versions might be supported by NestJS.
- A text editor of your choice.
- Clone/download the repository.

## Goals
- This project was developed to address the requirements defined in a Didomi challenge located [here](https://github.com/didomi/challenges/blob/96612679c628b1d3a8be742a193bc3ab78dd7aa2/backend/README.md)

## Data Model

The entity-relationship diagram that represents the data model for this exercise is:

![alt](https://github.com/davidmaceachern/consents-api/blob/99da50667de79e263fdb8120fc3ef7a779c8f6ef/diagrams/entity-relationship.png)

## System Architecture

Overview of the technical components. 

![alt](https://github.com/davidmaceachern/consents-api/blob/9bdae952f22b5d2216c25af480ec36669390b3ab/diagrams/system-architecture.png)

## Running the API

1. Open a terminal window
2. Run an instance of the Postgres database locally using the script found [here](https://github.com/davidmaceachern/consents-api/blob/31a108e611d5e15c2579f41d0713f7b29b2eadb4/start-postgres-tmpfs.sh)
3. Change directory to the root of the Node.js project `cd ./consents/`.
4. Run the server `npm run start`.

The API will be listening for requests at `http://localhost:3000/api/v1`.

You can view Swagger documentation by visiting `http://localhost:3000/api` in your browser.

## Running Unit Tests

1. Open a terminal window
2. Change directory to the root of the Node.js project `cd ./consents/`.
3. Run the unit tests `npm run test` or `npm run test:watch` to have continuous feedback.

## Running E2E Tests

1. Open a terminal window.
2. Run an instance of the Postgres database locally using the script found [here](https://github.com/davidmaceachern/consents-api/blob/31a108e611d5e15c2579f41d0713f7b29b2eadb4/start-postgres-tmpfs.sh)
3. Change directory to the root of the Node.js project `cd ./consents/`.
4. Run the e2e tests `npm run test:e2e` or `npm run test:e2eWatch` to have continuous feedback.

## Accessing the Development Database

The Postgres client will be required to access the database instance from the command line, and the database container should be running as described in `## Running E2E Tests`.

``` bash
psql -h localhost -U postgres -d postgres
```

Then enter the password found in the `.development.env`

In a separate terminal, running the server in development mode will automatically sync the database schema.

You should be able to run the following queries using the Postgresql client; to list the available tables `\dt` and to describe a database table `\d user` or `\d event`.


## Project Structure

```
├── CHALLENGE.md                        <------ The requirements specification this project is based on.
├── CHANGELOG.MD                        <------ Pull request notes may be added here.
├── README.md                           <------ Overall details about this project.
├── Dockerfile                          <------ Container definition for deploying the API.
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
│   ├── design.drawio                   <------ Drawings used to work through the specification.
│   ├── entity-relationship.png         <------ The data model that was implemented. 
│   ├── system-architecture.png         <------ What the application consists of technically.
└── start-postgres-tmpfs.sh
```

## Generating Docs

Swagger documentation can be accessed after running `npm run start` and visiting `http://localhost:3000/api` in a browser.

## Cleaning Up

Delete dangling resources `docker system prune` or all containers/images/builds `docker system prune -a`, **WARNING** this will delete any Docker resources on your machine. 

## Edge Cases

- [ ] If a user tries to use a consent id that does not match the supported id's the system does not validate their correctness.
- [ ] If user updates their consent status directly would that emit an event we need to handle here?
- [ ] If user is not a valid user, we would need to use an authentication layer to avoid this being a problem?
- [ ] The findAll operation might be improved by letting the user know when there are no events
- [ ] It might be easier to store the consent change types in a database table instead of in the application logic.
- [ ] Verify that a sad path for the userRepository.findOne operation is not needed
- [ ] There is currently no way to manage the database transaction lifecycle in the event that data needs to be manually rolled back https://docs.nestjs.com/techniques/database#transactions
- [ ] Migrations will be required if the database schema changes after v1 is deployed to production.

## Future Work

- [ ] Consider whether further decoupling would be beneficial, i.e. do we need to consider another Topic subscription service and task/queue outside of the container process.
- [ ] Refactor some of the code for increased readability, add a data factory for generating entity record test data.
- [ ] Add Logging, Telemetry, and Metrics using the standard that the organization has decided on.
- [ ] Move the Data transformations into the respective `Dto`.
- [ ] Run a memory profiling tool as described [here](https://www.toptal.com/nodejs/debugging-memory-leaks-node-js-applications), to identify opportunities for optimization.
- [ ] Refactor - Move to use DTO's as a factory in tests for generating records or move to .json
- [ ] Refactor - getChangeDescription
- [ ] Refactor/Optimisation/Bug - Fix foreign key on events, the current database design does not enforce the user -> entity "onetomany" relationship.
- [ ] Refactor/Optimisation/Bug - There is a problem where one emitted event is received by multiple event listeners. For commit "d8f2d7c8e3be6986f9ab0b3d714768057eda650a" when running the component tests and printing inside the consentchangedevent handler function, 5 logs are printed when only 3 events should have been created. For the userdeleted handler 2 logs are created for 1 event. This might require creating a single global event emitter module that can be used through the system instead of two intantiations.
- [ ] Chore - Switch on Typescript compiler strict typing and address the 25+ issues.
- [ ] Chore - getUsersConsents return type signature can replace ANY type with OR type
- [ ] Chore - Fix decorator @IsEmail() in Dto instead of calling class-validator directory in the user service.
- [ ] E2E tests might require a sleep timer to be used with the `afterEach` hook as occasionally a test case fails.