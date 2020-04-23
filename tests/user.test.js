const request = require('supertest');
const app = require("../src/app");
const User = require("../src/models/user");
const {userOneId, userOne, setupDatabase} = require('./fixtures/db');
beforeEach(setupDatabase);

test("User Singup", async ()=>{
    const response = await request(app).post("/users").send({
        name:"Leonardo",
        email:"leonardo@email.com",
        password:"Mypass555!"
    }).expect(201)

    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull();

    expect(response.body).toMatchObject({
        user:{
            name:"Leonardo",
            email:"leonardo@email.com"
        },
        token: user.tokens[0].token
    });

    expect(user.password).not.toBe("Mypass555!");
});

test("User Login",async()=>{
    const response = await request(app)
    .post("/users/login")
    .send({
        email:userOne.email,
        password:userOne.password
    }).expect(200)

    const user = await User.findById(userOne._id);
    expect(user.tokens[1].token).toBe(response.body.token);
});

test("User login fail",async ()=>{
    await request(app)
    .post("/users/login")
    .send({
        email:userOne.email,
        password:"notcorrectpass"
    }).expect(400)
});


test("Get User Profile",async()=>{
    await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
});

test("Unauthorized Get User Profile", async()=>{
    await request(app)
    .get("/users/me")
    .send()
    .expect(401)
});

test("Delete User Profile",async()=>{
    await request(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    const user = await User.findById(userOne._id);
    expect(user).toBeNull();
});

test("Upload avatar", async()=>{
    await request(app)
        .post("/users/me/avatar")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar','tests/fixtures/profile-pic.jpg')
        .expect(200)

    const user = await User.findById(userOneId);
    expect(user.avatar).toEqual(expect.any(Buffer));
})

test("Unauthorized Delete User Profile",async()=>{
    await request(app)
    .delete("/users/me")
    .send()
    .expect(401)
});

test("Update User info", async()=>{
    await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send({name:"Leonardo Afonso"})
        .expect(200)

    const user = await User.findById(userOneId);
    expect(user.name).toBe("Leonardo Afonso");
})

test("Update User non existent info", async()=>{
    await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send({location:"Brasil"})
        .expect(400)
})

test("Unauthorized Update User info", async()=>{
    await request(app)
        .patch("/users/me")
        .send({name:"Leonardo Afonso"})
        .expect(401)
})