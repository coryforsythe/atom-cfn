# atom-cfn

This package allows for validating and launching (currently without parameter entry) cloud formation stacks.  It aids in rapid development when validating against the Cloud Formation API is necessary

## Installation
e
It is necessary to configure a credentials file for the AWS SDK. The easiest way to do so is to install the AWS CLI Tools and use the aws configure command line tool.

    pip install aws-cli

    aws configure



To install the atom-cfn module simply instruct the Atom Pacakage Manager to perform the install

    apm install atom-cfn

## Usage

Once installed, the pacakge adds the commands cloudformation:Validate and cloudformation:Launch Stack to atom.  Run them from a JSON or YAML template for validation feedback from the API or to launch the template as a new stack.
