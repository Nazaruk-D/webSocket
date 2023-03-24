// const {connection} = require ("./websocketFunction");
// const jwt = require('jsonwebtoken');
//
// class authController {
//     async me(req, res) {
//         try {
//             const token = req.cookies.token;
//             if (!token) {
//                 return res.status(401).json({message: 'Unauthorized in token', token, statusCode: 401});
//             }
//             const decodedToken = jwt.verify(token, 'secret');
//             const name = decodedToken.name;
//             const userExistsQuery = `SELECT * FROM Users WHERE name = '${name}'`;
//             connection.query(userExistsQuery, (error, results) => {
//                 if (error) throw error;
//                 if (results.length === 1) {
//                     const user = results[0];
//                     const userData = {
//                         name: user.name,
//                         createdAt: user.created_at,
//                     };
//                     return res.status(200).json({data: userData, statusCode: 200});
//                 } else {
//                     return res.status(401).json({message: 'Unauthorized in user', statusCode: 401});
//                 }
//             });
//         } catch (e) {
//             console.log(e)
//             res.status(400).json({message: 'Me error', statusCode: 400})
//         }
//     }
//
//     async login(req, res) {
//         try {
//             const { name } = req.body;
//             const query = `SELECT * FROM Users WHERE name = '${name}'`;
//             connection.query(query, async (error, results) => {
//                 if (error) throw error;
//
//                 if (results.length > 0) {
//                     const user = results[0];
//                     const token = jwt.sign({ name: user.name }, 'secret');
//                     const userData = {
//                         name: user.name,
//                         createdAt: user.created_at,
//                     };
//                     res.cookie('token', token, {
//                         expires: new Date(Date.now() + (3600 * 1000 * 24 * 180 * 1)),
//                         sameSite: 'none',
//                         secure: true,
//                         httpOnly: true,
//                     });
//                     res.status(200).json({message: 'Login successful', user: userData, statusCode: 200});
//                 } else {
//                     const userRegisterQuery = `INSERT INTO Users (name) VALUES ('${name}')`;
//                     connection.query(userRegisterQuery, async (error, results) => {
//                         if (error) throw error;
//                         const newUserQuery = `SELECT * FROM Users WHERE name = '${name}'`;
//                         connection.query(newUserQuery, async (error, results) => {
//                             if (error) throw error;
//                             const user = results[0];
//                             const token = jwt.sign({ name: user.name }, 'secret');
//                             const userData = {
//                                 name: user.name,
//                                 createdAt: user.created_at,
//                             };
//                             res.cookie('token', token, {
//                                 expires: new Date(Date.now() + (3600 * 1000 * 24 * 180 * 1)),
//                                 sameSite: 'none',
//                                 secure: true,
//                                 httpOnly: true,
//                             });
//                             res.status(201).json({message: 'User registered and login successfully', user: userData, statusCode: 201});
//                         });
//                     });
//                 }
//             });
//             console.log('Connection closed');
//         } catch (e) {
//             res.status(400).json({ message: 'Login error', statusCode: 400 });
//         }
//     }
//
//     async logout(req, res) {
//         try {
//             res.cookie('token', "", {
//                 expires: new Date(0),
//                 sameSite: 'none',
//                 secure: "true",
//                 httpOnly: true,
//             })
//             res.status(200).json({message: 'Logout successful', statusCode: 200});
//         } catch (e) {
//             console.log(e)
//             res.status(400).json({message: 'Logout error', statusCode: 400})
//         }
//     }
// }
//
// module.exports = new authController()
