var https = require('https');
const fs = require("fs");
const util = require('util');
const prompt = require('prompt-sync')();
const exec = util.promisify(require('child_process').exec);

function connectionCode(url) {
  return new Promise(function(resolve, reject) {
    https.get(url,  function(res){
      //console.log("StatusCode: ",  res.statusCode);
      if (res.statusCode == 200 ) {
        resolve(res.statusCode)
      } else {
        reject(res.statusCode)
      }
    });
  });
}
function askCommitNumber(){
  var nbCommits;
  nbCommits = prompt('Enter the number of commits you want (>= 2): ');
  return nbCommits;
}

function askRepo(){
  var repo = prompt('Enter the git you want to add commits to : ');
  return repo;
}

async function commitBot() {
  /* Checking internet status */
  url='https://www.google.fr';
  var statusCodeTest = await connectionCode(url);
  if(statusCodeTest == 200){
    nbCommits = askCommitNumber(); //getting number of commits
    //Checking number of commits
    if(Number(nbCommits) < 2){
      console.log("\nPLEASE ENTER A NUMBER GREATER OR EQUAL TO 2");
      process.exit(1);
    }
    var repo = prompt('Enter the git you want to add commits to : '); //getting the repository
    // var mail = prompt('Enter your github mail : ');
    // var name = prompt('Enter your github username : ');

    //Checking validity of repo
    if(!repo.startsWith("https://")){
      console.log("\nPLEASE ENTER THE FULL REPOSITORY URL");
      console.log("For example : https://github.com/N0Ls/CommitBot");
      process.exit(1);
    }
    var codeRepo = await connectionCode(repo);
    if(codeRepo == 200){
      console.log("[+] Repository found");
      //Creating folder for the local repository clone
      if (fs.existsSync("gitfolder")) {
          console.log("[+] Folder found");
          var { stdout, stderr } = await exec("cd gitfolder && rm -rf *");
      }
      else{
          console.log("[-] Folder not found");
          console.log("[+] Creating folder");
          var { stdout, stderr } = await exec("mkdir gitfolder");
          var { stdout, stderr }  = await exec("cd gitfolder && rm -rf *");
      }

      //Cloning the remote repository
      var { stdout, stderr } = await exec("cd gitfolder && git clone "+repo);
      console.log("[+] Repository downloaded");

      //Getting the name of reposiory
      var parts = repo.split('/');
      var repoName = parts[parts.length - 1];

      // var { stdout, stderr } = await exec('cd gitfolder/'+repoName+' git config user.name \"'+name+'\"');
      // var { stdout, stderr } = await exec('cd gitfolder/'+repoName+' git config user.email \"'+mail+'\"');

      //Beginning of commit loop
      for (var i = 0; i < Number(nbCommits)-1; i++) {

        //Content of commit
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0');
        var yyyy = today.getFullYear();
        var h = today.getHours();
        var m = today.getMinutes();
        var s = today.getSeconds();
        var ms = today.getMilliseconds();
        today = mm + '/' + dd + '/' + yyyy + ' ' + h + ' h ' + m + ' ' + s + ':' + ms;

        var commit="Commit: Update commits @ "+ today;

        //Commit
        var { stdout, stderr } = await exec("echo " + commit + " > gitfolder/"+repoName+"/commit.md");
        var { stdout, stderr } = await exec("cd gitfolder/"+repoName+" && git add commit.md");
        var { stdout, stderr } = await exec("cd gitfolder/"+repoName+" && git commit -m 'Commit "+ (i + 1) + " made by N0Ls commit bot'");
        console.log("-- Commit " + (i + 1) + " --");
      }

      //Final Commit
      var { stdout, stderr } = await exec("cd gitfolder/"+repoName+" && rm commit.md");
      var { stdout, stderr } = await exec("cd gitfolder/"+repoName+" && git gc");
      var { stdout, stderr } = await exec("cd gitfolder/"+repoName+" && git add .");
      var { stdout, stderr } = await exec("cd gitfolder/"+repoName+" && git commit -m 'Final commit made by N0Ls commit bot'");

      //Final push
      var { stdout, stderr } = await exec("cd gitfolder/"+repoName+" && git push origin master");

      //Cleaning files
      var { stdout, stderr } = await exec("cd gitfolder && rm -rf *");
    }
  }
}
commitBot();
