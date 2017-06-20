'use strict';
const Code = require('code');

const Config = require('../../../config');
const Hapi = require('hapi');
const HapiAuth = require('hapi-auth-cookie');
const AuthPlugin = require('../../../server/auth');
const Manifest = require('../../../manifest');
const HomePlugin = require('../../../server/web/home/index');
const CustomAccount = require('../fixtures/credentials-custom-account');

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


lab.experiment('Panel in Home Page, Logged In As Can-List-Posts Account', () => {


    lab.test('renders properly', (done) => {

        request = {
            method: 'GET',
            url: '/',
            credentials:CustomAccount(['can-list-posts'])

        };

        server.inject(request, (response) => {

            //Elements that have to be there
            Code.expect(response.result).to.match(/<li class="[a-z0-9]*"><a href="\/[a-z0-9\/\-_]*">Posts<\/a><\/li>/i);


            Code.expect(response.statusCode).to.equal(200);

            done();
        });
    });
});


