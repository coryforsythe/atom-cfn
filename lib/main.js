'use babel';
import { CompositeDisposable } from 'atom';
var uuid=require('node-uuid');
var fs=require('fs');
var ini=require('ini');
var osenv = require('osenv')
var AWS=require("aws-sdk");


const Package = {
  subscriptions: null,
  config:{
    region: {type:'string'},
    secretAccessKey: {type:'string'},
    accessKeyId: {type:'string'}
  },


  activate (state) {
    //DEBUG
    var credFile=osenv.home()+"/.aws/credentials";
    var creds =ini.parse(fs.readFileSync(credFile, 'utf8'));

    if (fs.existsSync(credFile)) {
      var defaultRegion=creds.default.region || 'us-east-1';

      if(!creds.default.region)
          atom.notifications.addSuccess("No default region detected",{detail:"Consider adding your desired region to the AWS credentials file: "+credFile,dismissable:true});

              atom.config.set("cloudformation.region",defaultRegion);
              atom.config.set("cloudformation.accessKeyId",creds.default.aws_access_key_id);
              atom.config.set("cloudformation.secretAccessKey",creds.default.aws_secret_access_key);
    }
    else {
      atom.notifications.addError("Couldn't load AWS Credentials\n\n",{detail:"Try installing the AWS CLI and configuring it prior to using this plugin.",dismissable:true});
    }

    // Activates and restores the previous session of your package.
    // Assign a new instance of CompositeDisposable...
   this.subscriptions = new CompositeDisposable();
   this.subscriptions.add(
     atom.commands.add('atom-workspace', {
       'cloudformation:Validate': this.ValidateTemplate
     })
   );
   this.subscriptions.add(
     atom.commands.add('atom-workspace', {
       'cloudformation:Launch Stack': this.LaunchStack
     })
   );
   this.subscriptions.add(
     atom.commands.add('atom-workspace', {
       'cloudformation:Create Change Set': this.CreateChangeSet
     })
   )
  },
  deactivate () {
    // When the user or Atom itself kills a window, this method is called.
  },
  serialize () {
    // To save the current package's state, this method should return
    // an object containing all required data.
  },
  LaunchStack(){
        AWS.config.update({region:atom.config.get('cloudformation.region'),accessKeyId:atom.config.get('cloudformation.accessKeyId'),
          secretAccessKey:atom.config.get('cloudformation.secretAccessKey')})
        editor = atom.workspace.getActiveTextEditor();
        text=editor.getText();
        cloudformation = new AWS.CloudFormation();
        params={
        StackName:"Atom-"+uuid.v4(),
        Capabilities: ['CAPABILITY_NAMED_IAM','CAPABILITY_IAM'],
        TemplateBody: text
       };
        cloudformation.createStack(params, function(err, data) {
           if (err) {

             atom.notifications.addError("Creation Error!\n\n",{detail:err,dismissable:true});
           }
           else   {
              atom.notifications.addSuccess("Creation in Progress!",{detail:data.ResponseMetadata.RequestId,dismissable:true});
            }

    });
  },

  ValidateTemplate(){
    AWS.config.update({region:atom.config.get('cloudformation.region'),accessKeyId:atom.config.get('cloudformation.accessKeyId'),
      secretAccessKey:atom.config.get('cloudformation.secretAccessKey')})
    editor = atom.workspace.getActiveTextEditor();
    text=editor.getText();
    cloudformation = new AWS.CloudFormation();
    params={
     TemplateBody: text
   };
    cloudformation.validateTemplate(params, function(err, data) {
       if (err) {
         atom.notifications.addError("Validation Error!\n\n",{detail:err,dismissable:true});
       }
       else   {
          atom.notifications.addSuccess("Validation OK!",{detail:data.ResponseMetadata.RequestId,dismissable:true});
       }
});

},

CreateChangeSet() {
          AWS.config.update({region:atom.config.get('cloudformation.region'),accessKeyId:atom.config.get('cloudformation.accessKeyId'),
            secretAccessKey:atom.config.get('cloudformation.secretAccessKey')})
          editor = atom.workspace.getActiveTextEditor();
          text=editor.getText();
          cloudformation = new AWS.CloudFormation();
          StackName="Atom-"+uuid.v4()
          params = {
            ChangeSetName: 'ChangeSet-'+StackName,
            StackName: StackName,
            Capabilities: ['CAPABILITY_NAMED_IAM','CAPABILITY_IAM'],
            ChangeSetType: 'CREATE',
            Description: 'An automated change set sent from ATOM-CFN',
            TemplateBody:text
          };
          cloudformation.createChangeSet(params, function(err, data) {
             if (err) {

               atom.notifications.addError("Creation Error!\n\n",{detail:err,dismissable:true});
             }
             else   {
                atom.notifications.addSuccess("Creation in Progress!",{detail:data.ResponseMetadata.RequestId,dismissable:true});
              }

      });
}
};

export default Package;
