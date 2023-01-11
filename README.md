## List of technologies used in project:

- Node.js
- Express.js
- MongoDB

## Documentation

## 1. **GET** /tasks

Should return list of tasks.

_Optional query parameters_:

1. assignee
2. column
3. tags
4. page
5. per page

## 2. **POST** /tasks

Should create new task.

_Body_:

1. title: `String`,
2. description: `String`,
3. link: `String`,
4. tags: `Array<tagID>`,
5. dueDate: `Date`,
6. assignee: `userID`,
7. column: `columnID`,
8. comments: `Array<String>`

## 3. **PUT** /tasks/:id

Should edit existing task.

_Path parameters_:

1. id: `todoID`

_Body_:

1. title: `String`,
2. description: `String`,
3. link: `String`,
4. tags: `Array<tagID>`,
5. dueDate: `Date`,
6. assignee: `userID`,
7. column: `columnID`,
8. comments: `Array<String>`

## 4. **GET** /tags

Should return list of tags.

## 5. **POST** /tags

Should create new tag.

_Body_:

1. name: `String`,
2. color: `String`

## 6. **PUT** /tags/:id

Should edit existing tag.

_Path parameters_:

1. id: `tagID`

_Body_:

1. name: `String`,
2. color: `String`

## 7. **GET** /users

Should return list of users.

## 8.1. **POST** /users

Should create new user (with image as string).

_Body_:

1. name: `String`,
2. description: `String`,
3. imageURL: `String`

## 8.2. **POST** /users

Should create new user (with image as file).

_Form data_:

1. name: `String`,
2. description: `String`,
3. imageURL: `String`

## 9.1. **PUT** /users/:id

Should edit existing user (with image as string).

_Path parameters_:

1. id: `userID`

_Body_:

1. name: `String`,
2. description: `String`,
3. imageURL: `String`

## 9.2. **PUT** /users/:id

Should edit existing user (with image as file).

_Path parameters_:

1. id: `userID`

_Body_:

1. name: `String`,
2. description: `String`,
3. imageURL: `String`

## 10. **GET** /columns

Should return list of columns.

## 11. **POST** /columns

Should create new column.

_Body_:

1. name: `String`

## 12. **PUT** /columns/:id

Should edit existing column.

_Path parameters_:

1. id: `columnID`

_Body_:

1. name: `String`
