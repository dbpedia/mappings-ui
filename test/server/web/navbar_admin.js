'use strict';
const Code = require('code');

const Config = require('../../../config');
const Hapi = require('hapi');
const HapiAuth = require('hapi-auth-cookie');
const AuthPlugin = require('../../../server/auth');
const Manifest = require('../../../manifest');
const HomePlugin = require('../../../server/web/home/index');
const AuthenticatedAdmin = require('../fixtures/credentials-admin');


const Lab = require('lab');
const Path = require('path');
const Vision = require('vision');


const lab = exports.lab = Lab.script();
const ModelsPlugin = {
    register: require('hapi-mongo-models'),
    options: Manifest.get('/registrations').filter((reg) => {

        return reg.plugin.register === 'hapi-mongo-models';
    })[0].plugin.options
};
let request;
let server;


lab.beforeEach((done) => {

    const plugins = [Vision, HapiAuth,AuthPlugin,ModelsPlugin,HomePlugin];
    server = new Hapi.Server();
    server.connection({ port: Config.get('/port/web') });
    server.register(plugins, (err) => {

        if (err) {
            return done(err);
        }

        server.views({
            engines: { jsx: require('hapi-react-views') },
            path: './server/web',
            relativeTo: Path.join(__dirname, '..', '..', '..')
        });

        server.initialize(done());
    });
});


lab.experiment('Panel in Home Page, Logged In As Admin Account', () => {


    lab.test('renders properly', (done) => {

        request = {
            method: 'GET',
            url: '/',
            credentials:AuthenticatedAdmin

        };

        server.inject(request, (response) => {

            //Elements that have to be there
            Code.expect(response.result).to.match(/<li class="[a-z0-9]*"><a href="\/[a-z0-9\/\-_]*">Home<\/a><\/li>/i);
            Code.expect(response.result).to.match(/<li class="[a-z0-9]*"><a href="\/[a-z0-9\/\-_]*">My Profile<\/a><\/li>/i);
            Code.expect(response.result).to.match(/<li class="[a-z0-9]*"><a href="\/[a-z0-9\/\-_]*">Sign Out<\/a><\/li>/i);
            Code.expect(response.result).to.match(/<li class="[a-z0-9]*"><a href="\/[a-z0-9\/\-_]*">Accounts<\/a><\/li>/i);
            Code.expect(response.result).to.match(/<li class="[a-z0-9]*"><a href="\/[a-z0-9\/\-_]*">Groups<\/a><\/li>/i);
            Code.expect(response.result).to.match(/<li class="[a-z0-9]*"><a href="\/[a-z0-9\/\-_]*">Help Posts<\/a><\/li>/i);


            //Elements that cant be there
            Code.expect(response.result).to.not.match(/<li class="[a-z0-9]*"><a href="\/[a-z0-9\/\-_]*">Sign up<\/a><\/li>/i);
            Code.expect(response.result).to.not.match(/<li class="[a-z0-9]*"><a href="\/[a-z0-9\/\-_]*">Sign in<\/a><\/li>/i);




            Code.expect(response.statusCode).to.equal(200);

            done();
        });
    });
});


