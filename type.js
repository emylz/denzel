const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt
} = require('graphql');

// Define Movie Type
movieType = new GraphQLObjectType({
    name: 'Movie',
    fields: {
        id : { type : GraphQLString },
        link: { type: GraphQLString },
        metascore: { type: GraphQLInt },
        synopsis: { type: GraphQLString },
        title: { type: GraphQLString },
        year: { type: GraphQLInt },
        date: {type:GraphQLString},
        review: {type:GraphQLString}
    }
});

exports.movieType = movieType;
