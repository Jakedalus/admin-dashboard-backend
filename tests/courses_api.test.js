const mongoose = require('mongoose');
const supertest = require('supertest');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = require('../app');

const api = supertest(app);
const User = require('../models/user');
const initialUsers = [
	{
		username     : 'francis',
		name         : 'Frank Grimes',
		email        : 'frank.grimes@gmail.com',
		passwordHash : 'abcd1234',
		_id          : '609eea9a38af2f0a45b4f831',
		courses      : [ '5ff8e97be70f49b594daa4a6' ]
	},
	{
		username     : 'susan',
		name         : 'Sue Jones',
		email        : 'sue.jones@gmail.com',
		passwordHash : 'abcd1234',
		_id          : '609eea9a38af2f0a45b4f832',
		courses      : [ '5a422a851b54a676234d17f7' ]
	}
];

const Course = require('../models/course');
const initialCourses = [
	{
		title     : 'Sample Course',
		teacher   : 'Ms. Jones',
		subject   : 'Physics',
		user      : '609eea9a38af2f0a45b4f832',
		_id       : '5a422a851b54a676234d17f7',
		questions : [
			{
				question : 'question1',
				answer   : 'answer1'
			},
			{
				question : 'question2',
				answer   : 'answer2'
			}
		]
	},
	{
		title     : 'Sample Course 2',
		teacher   : 'Mr. Smith',
		subject   : 'Literature',
		user      : '609eea9a38af2f0a45b4f831',
		_id       : '5ff8e97be70f49b594daa4a6',
		questions : [
			{
				question : 'question1',
				answer   : 'answer1'
			},
			{
				question : 'question2',
				answer   : 'answer2'
			},
			{
				question : 'question3',
				answer   : 'answer3'
			}
		]
	}
];

let token;

beforeEach(async () => {
	// Initialize Users
	await User.deleteMany({});

	// const saltRounds = 10;
	// let passwordHash = await bcrypt.hash(
	// 	password,
	// 	saltRounds
	// );

	let userObj = new User(initialUsers[0]);
	const user1 = await userObj.save();

	userObj = new User(initialUsers[1]);
	const user2 = await userObj.save();

	// console.log(`user1`, user1);
	// console.log(`user2`, user2);

	// Initialize Courses
	await Course.deleteMany({});

	let courseObj = new Course(initialCourses[0]);
	const course1 = await courseObj.save();

	courseObj = new Course(initialCourses[1]);
	const course2 = await courseObj.save();

	// console.log(`course1`, course1);
	// console.log(`course2`, course2);

	// Login francis and get token
	const user = await User.findOne({
		username : 'francis'
	});

	const userForToken = {
		username : user.username,
		id       : user._id
	};

	token = jwt.sign(userForToken, process.env.SECRET);

	// console.log('token', token);
});

describe('course api tests', () => {
	test('courses are returned as json', async () => {
		// console.log(`app`, app);
		// console.log(`api`, api);

		const response = await api
			.get('/api/courses')
			.expect(200)
			.expect('Content-Type', /application\/json/);

		// console.log(`response.body`, response.body);
	});

	test('there are two courses', async () => {
		const response = await api.get('/api/courses');

		expect(response.body).toHaveLength(2);
	});

	test('courses should have an "id" property', async () => {
		const response = await api.get('/api/courses');

		// console.log(response.body);

		expect(response.body[0].id).toBeDefined();
	});

	test('new course should be added to the database', async () => {
		const newCourse = {
			title     : 'Sample Course 3',
			teacher   : 'Mr. Fredrick',
			subject   : 'Math',
			user      : '609eea9a38af2f0a45b4f831',
			_id       : '5ff8e97be79f43b594daa4a6',
			questions : [
				{
					question : 'question1',
					answer   : 'answer1'
				},
				{
					question : 'question2',
					answer   : 'answer2'
				},
				{
					question : 'question3',
					answer   : 'answer3'
				}
			]
		};

		await api
			.post('/api/courses')
			.set('Authorization', 'Bearer ' + token)
			.send(newCourse)
			.expect(201)
			.expect('Content-Type', /application\/json/);

		const response = await api.get('/api/courses');

		console.log(`response.body`, response.body);

		const contents = response.body.map(r => r.title);

		expect(response.body).toHaveLength(3);
		expect(contents).toContain('Sample Course 3');
	});
});

afterAll(() => {
	mongoose.connection.close();
});