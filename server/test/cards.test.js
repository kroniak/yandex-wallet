process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const fs = require('fs');
const server = require('../index');
const should = chai.should();
const util = require('util');

const writeFile = util.promisify(fs.writeFile);

chai.use(chaiHttp);

const CARDS_FILE_NAME = '/../db/cards.json';
const TRANSACTIONS_FILE_NAME = '/../db/transactions.json'

describe('Cards', () => {
    /**
     * Восстанавливает базу данных в первоначальное состояние
     * 
     * @param {Function} done 
     */
    function restoreDb(done) {
        const cards = [
            {
                "id": 0,
                "cardNumber": "5106216010173049",
                "balance": 15000
            },
            {
                "id": 1,
                "cardNumber": "5106216010126757",
                "balance": 700
            }
        ];

        const transactions = [{
            "id": 1,
            "cardId": 1,
            "type": "prepaidCard",
            "data": "220003000000003",
            "time": "2017-08-9T05:28:31+03:00",
            "sum": "10"
        }];

        Promise.all(
            [writeFile(__dirname + CARDS_FILE_NAME, JSON.stringify(cards)),
                writeFile(__dirname + TRANSACTIONS_FILE_NAME, JSON.stringify(transactions))]
        ).then(() => done());
    }

    beforeEach(done => restoreDb(done));

    describe('/GET cards', () => {
        it('it should GET all the cards in db', done => {
            chai.request(server)
                .get('/cards')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.type.should.eql('application/json');
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(2);
                    done();
                });
        });
    });

    describe('/POST new card', () => {
        it('it should not POST new card with empty body', done => {
            chai.request(server)
                .post('/cards')
                .send({})
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });

        it('it should not POST new card with empty cardNumber', done => {
            chai.request(server)
                .post('/cards')
                .send({
                    cardNumber: ''
                })
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });

        it('it should not POST new card with non valid cardNumber', done => {
            chai.request(server)
                .post('/cards')
                .send({
                    cardNumber: '15133306216010173046'
                })
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });

        it('it should not POST new card with existing cardNumber', done => {
            chai.request(server)
                .post('/cards')
                .send({
                    cardNumber: '5106216010173049'
                })
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });

        it('it should POST new card with balance', done => {
            chai.request(server)
                .post('/cards')
                .send({
                    cardNumber: '5483874041820682',
                    balance: 10000
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.type.should.eql('application/json');
                    res.body.should.be.a('object');
                    res.body.should.have.property('id').eql(2);
                    res.body.should.have.property('cardNumber').eql('5483874041820682');
                    res.body.should.have.property('cardType').eql('mastercard');
                    res.body.should.have.property('balance').eql(10000);
                    done();
                });
        });

        it('it should POST new card with zero balance', done => {
            chai.request(server)
                .post('/cards')
                .send({
                    cardNumber: '5483874041820682'
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.type.should.eql('application/json');
                    res.body.should.be.a('object');
                    res.body.should.have.property('id').eql(2);
                    res.body.should.have.property('cardNumber').eql('5483874041820682');
                    res.body.should.have.property('cardType').eql('mastercard');
                    res.body.should.have.property('balance').eql(0);
                    done();
                });

        });
    });

    describe('/DELETE card', () => {
        it('it should not DELETE card with not real id', done => {
            chai.request(server)
                .delete('/cards/3')
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                });
        });

        it('it should DELETE card with real id', done => {
            chai.request(server)
                .delete('/cards/1')
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });
    });

    describe('/GET transactions by card id', () => {
        it('should get all transactions by card id === 1', done => {
            chai.request(server)
                .get('/cards/1/transactions')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.type.should.eql('application/json');
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(1);
                    res.body[0].should.have.property('id').eql(1);
                    res.body[0].should.have.property('cardId').eql(1);
                    res.body[0].should.have.property('type').eql('prepaidCard');
                    res.body[0].should.have.property('data').eql('220003000000003');
                    res.body[0].should.have.property('time').eql('2017-08-9T05:28:31+03:00');
                    res.body[0].should.have.property('sum').eql('10');

                    done();
                });
        });

        it('should get empty list of transactions by card id === 2', done => {
            chai.request(server)
                .get('/cards/2/transactions')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.type.should.eql('application/json');
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(0);
                    done();
                });
        });
    });

    describe('/POST', () => {
        it('', () => {

        });
    });
});