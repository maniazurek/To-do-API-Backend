## List of technologies used in project:

- Node.js
- Express.js
- MongoDB

## Documentation

## 1. **POST** /signup

_Body_:

1. login: `String`,
2. password: `String`

## 2. **POST** /signin

_Body_:

1. login: `String`,
2. password: `String`

## 3. **GET** /tasks

Should return list of tasks.

_Optional query parameters_:

1. user
2. column
3. tags
4. page
5. per page

## 4. **POST** /tasks

Should create new task.

_Body_:

1. title: `String`,
2. description: `String`,
3. link: `String`,
4. tags: `Array<tagID>`,
5. dueDate: `Date`,
6. user: `userID`,
7. column: `columnID`,
8. comments: `Array<String>`

## 5. **PUT** /tasks/:id

Should edit existing task.

_Path parameters_:

1. id: `todoID`

_Body_:

1. title: `String`,
2. description: `String`,
3. link: `String`,
4. tags: `Array<tagID>`,
5. dueDate: `Date`,
6. user: `userID`,
7. column: `columnID`,
8. comments: `Array<String>`

## 6. **GET** /tags

Should return list of tags.

## 7. **POST** /tags

Should create new tag.

_Body_:

1. name: `String`,
2. color: `String`

## 8. **PUT** /tags/:id

Should edit existing tag.

_Path parameters_:

1. id: `tagID`

_Body_:

1. name: `String`,
2. color: `String`

## 9. **GET** /users

Should return list of users.

## 10.1. **POST** /users

Should create new user (with image as string).

_Body_:

1. name: `String`,
2. description: `String`,
3. imageURL: `String`

## 10.2. **POST** /users

Should create new user (with image as file).

_Form data_:

1. name: `String`,
2. description: `String`,
3. imageURL: `String`

## 11.1. **PUT** /users/:id

Should edit existing user (with image as string).

_Path parameters_:

1. id: `userID`

_Body_:

1. name: `String`,
2. description: `String`,
3. imageURL: `String`

## 11.2. **PUT** /users/:id

Should edit existing user (with image as file).

_Path parameters_:

1. id: `userID`

_Body_:

1. name: `String`,
2. description: `String`,
3. imageURL: `String`

## 12. **GET** /columns

Should return list of columns.

## 13. **POST** /columns

Should create new column.

_Body_:

1. name: `String`

## 14. **PUT** /columns/:id

Should edit existing column.

_Path parameters_:

1. id: `columnID`

_Body_:

1. name: `String`
