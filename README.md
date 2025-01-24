# CPSC 310 Project Repository

This repository contains starter code for the class project.
Please keep your repository private.

For information about the project, autotest, and the checkpoints, see the course webpage.

## Configuring your environment

To start using this project, you need to get your computer configured so you can build and execute the code.
To do this, follow these steps; the specifics of each step (especially the first two) will vary based on which operating system your computer has:

1. [Install git](https://git-scm.com/downloads) (v2.X). After installing you should be able to execute `git --version` on the command line.

1. [Install Node LTS](https://nodejs.org/en/download/), which will also install NPM (you should be able to execute `node --version` and `npm --version` on the command line).

1. [Install Yarn](https://yarnpkg.com/en/docs/install) (v1.22+). You should be able to execute `yarn --version` afterwards.

1. Clone your repository by running `git clone REPO_URL` from the command line. You can get the REPO_URL by clicking on the green button on your project repository page on GitHub. Note that due to new department changes you can no longer access private git resources using https and a username and password. You will need to use either [an access token](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line) or [SSH](https://help.github.com/en/github/authenticating-to-github/adding-a-new-ssh-key-to-your-github-account).

## Project commands

Once your environment is configured you need to further prepare the project's tooling and dependencies.
In the project folder:

1. `yarn install` to download the packages specified in your project's *package.json* to the *node_modules* directory.

1. `yarn build` to compile your project. You must run this command after making changes to your TypeScript files.

1. `yarn test` to run the test suite.

1. `yarn pretty` to prettify your project code.

## Running and testing from an IDE

IntelliJ Ultimate should be automatically configured the first time you open the project (IntelliJ Ultimate is a free download through their students program)

### License

While the readings for this course are licensed using [CC-by-SA](https://creativecommons.org/licenses/by-sa/3.0/), **checkpoint descriptions and implementations are considered private materials**. Please do not post or share your project solutions. We go to considerable lengths to make the project an interesting and useful learning experience for this course. This is a great deal of work, and while future students may be tempted by your solutions, posting them does not do them any real favours. Please be considerate with these private materials and not pass them along to others, make your repos public, or post them to other sites online.


Structure of dataset.json:

```
{
"datasets": {
	"dataset1id":{
		"id":"dataset1id",
		"courses": 
			[
				{"course1id":[{},{},{}], 
				"course2id":[{},{},{}]}
			]
		}
	"dataset2id": {}
	}
}
```



Example dataset.json file with one dataset called "sections" which has two courses "ARST500" and "CPSC313": 
```
{
  "datasets": {
    "sections": {
      "id": "sections",
      "courses": [
        {
          "ARST500": [
            {
              "dept": "arst",
              "id": "500",
              "avg": 94,
              "instructor": "tba",
              "title": "info tech&archvs",
              "pass": 11,
              "fail": 0,
              "audit": 0,
              "uuid": "14803",
              "year": "2012"
            },
            {
              "dept": "arst",
              "id": "500",
              "avg": 94,
              "instructor": "",
              "title": "info tech&archvs",
              "pass": 11,
              "fail": 0,
              "audit": 0,
              "uuid": "14804",
              "year": 1900
            }
          ],
          "CPSC313": [
            {
              "dept": "cpsc",
              "id": "500",
              "avg": 94,
              "instructor": "tba",
              "title": "info tech&archvs",
              "pass": 11,
              "fail": 0,
              "audit": 0,
              "uuid": "14803",
              "year": "2012"
            },
            {
              "dept": "cpsc",
              "id": "500",
              "avg": 94,
              "instructor": "",
              "title": "info tech&archvs",
              "pass": 11,
              "fail": 0,
              "audit": 0,
              "uuid": "14804",
              "year": 1900
            },
            {
              "dept": "arst",
              "id": "500",
              "avg": 85.75,
              "instructor": "",
              "title": "info tech&archvs",
              "pass": 20,
              "fail": 0,
              "audit": 0,
              "uuid": "26273",
              "year": "2008"
            },
            {
              "dept": "cpsc",
              "id": "500",
              "avg": 85.75,
              "instructor": "",
              "title": "info tech&archvs",
              "pass": 20,
              "fail": 0,
              "audit": 0,
              "uuid": "26274",
              "year": 1900
            },
            {
              "dept": "cpsc",
              "id": "500",
              "avg": 86.46,
              "instructor": "alexander-gooding, sharon",
              "title": "info tech&archvs",
              "pass": 26,
              "fail": 0,
              "audit": 0,
              "uuid": "28030",
              "year": "2011"
            },
            {
              "dept": "cpsc",
              "id": "500",
              "avg": 86.46,
              "instructor": "",
              "title": "info tech&archvs",
              "pass": 26,
              "fail": 0,
              "audit": 0,
              "uuid": "28031",
              "year": 1900
            }
          ]
        }
      ],
      "numRows": 8,
      "kind": "sections"
    }
  }
}
```
