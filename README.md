WikiFTP
=======

> FTP like access, to multiple folders on a single machine

Introduction
------------
WikiFTP is a web Application that facilitates to transfer, share files among the users. WikiFTP uses HTTP protocol to upload or download files from remote system. A WikiFTP admin creates a user and grants him access permission to a directory or a list of directories. User should login with the admin provided login credential (password can be changed later) to access his files on the remote system. User access is limited to particular directory, which is specified by the admin while creating user. When a user logs into the remote system, he is directed(or shown) to his directory only. User can manage files which are available in his directory in full fledge.

Features
--------
 - Users can access multiple directory paths unlike traditional FTP clients allow only a single path on a single system.
 - Admin decided what directories users can access.
 - Sharing of files(Folders only) among the users facilities them to access other user’s files.
 - Unzip, download or delete files on the remote system.
 - The actual path which user accesses on the system is hidden from the user. They can only see the name as aliases.

Version
-------
1.0.0

Tech
----
WikiFTP uses a number of open source projects to work properly:

* [Twitter Bootstrap] - great UI boilerplate for modern web apps
* [node.js] - evented I/O for the backend
* [MongoDB] - open source document database
* [Express] - fast node.js network app framework [@tjholowaychuk]
* [jQuery] -  fast, small, and feature-rich JavaScript library
* [Bootbox] - dialog boxes for twitter bootstrap
* [Plupload] - Multi-runtime File-Uploader
* [EJS] - JavaScript templating

Installation
------------
 - Clone this project.

 - Install MongoDB.
For instructions see here: http://docs.mongodb.org/manual/installation/

 - Install Node.js.
For instructions see here: http://nodejs.org
 - Install all dependencies in node.js
```sh
npm install
```
Then start the app
```sh
node server
```


License
----

MIT


**Free Software, Yay!**

Usage
-----
Initially a user should logon to WikiFTP as an admin. Admin is the master of the WikiFTP who creates user and manages their accounts. By default username of the admin is hardcoded and cannot be changed. So an admin cannot change his username but can change his password in his settings section. By default when the application is hosted the admin password is set to ‘admin’. After logging into wikiFTP as admin, an admin can create any no.of users. Each user has their own directory(Account) which can be accessed by the particular user only. 

##### Creating a User
To create a user, admin has to enter new username and password for the user. User name should be unique. After adding user successfully, admin has to assign a valid directory that is present on the remote system disk. Enter the path of the directory in the ‘path’ field. For the sake of security reasons, path of the directory is hidden and shown with alias name in the url when user logs into his account. Usually alias name can be set of characters to identify directory uniquely.

#####Managing User Account     
Admin is the super user of the wikiFTP. He can manage and control their access permissions by granting permission and revoking them if he wants deny them from being using resource.
Admin can grant access permissions to multiple directories for a single user. All the directories which are assigned or shared directories are listed. To deny a user from being using a directory, just delete the directory. Upon doing deleting directory, user will no longer can access directory and resource available in that particular directory. Admin can delete a user if requires. To delete user click on “Delete this User”. Deleted user cannot login again until admin creates a new account for the user.
User Account

To logon to user account, a user should get authenticated by supplying valid credentials. On successful authentication user is directed to his home page where a list of directories are listed for which user has access permission. 
Managing Files
 - To download a file, simply click on the file.
 - To share a file, select the folder and enter the share holder name in the popup.
NOTE: Only directories(folders) can be shared, not files).


#####Sharing
 - When a resource is shared, the user on the other hand will get the access permission to that directory. The directory is visible on the home page of the share holder. The directory name is appended with sharing user’s username(sender’s username). 
 - When a user shares something with other users, admin can have a look on the user activities by selecting the user profile. All the shared directories and allotted directories are listed here.     
 - User cannot share root directory. He can share any sub directory of the root directory.   
 - User can delete a file or a folder. The deleted file will be permanently deleted as it is removed from the remote machines disk. 


[node.js]:http://nodejs.org
[Twitter Bootstrap]:http://twitter.github.com/bootstrap/
[jQuery]:http://jquery.com
[express]:http://expressjs.com
[EJS]:http://embeddedjs.com/
[Plupload]:https://github.com/moxiecode/plupload
[Bootbox]:http://bootboxjs.com/
[MongoDB]:http://www.mongodb.org/
