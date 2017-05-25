import { Accounts } from 'meteor/accounts-base';
 
Accounts.ui.config({
  passwordSignupFields: 'USERNAME_ONLY',
});

Accounts.onLogin(function () {
    if (FlowRouter.current().route.name === 'login') {
    	FlowRouter.go("/");
    }
});

Accounts.onLogout(function () {
	console.log('onLogout redirect');
    FlowRouter.go("/login");
});