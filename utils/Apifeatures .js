class ApiFeatures {
  constructor(query, queryString) {
    // query is the query object from the model like Product.find()
    // queryString is the query string object from the request ?page=1
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    let queryObj = { ...this.queryString };
    const excludeFields = ['page', 'limit', 'sort', 'fields', 'keyword'];
    excludeFields.forEach((field) => delete queryObj[field]);
    // replace gte, gt, lte, lt with $gte, $gt, $lte, $lt
    // {price: {$gte: 1000}, ratingsAverage: {$gte: 4}}
    const queryString = JSON.stringify(queryObj);
    queryObj = JSON.parse(
      queryString.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)
    );
    this.query = this.query.find(queryObj);
    return this;
  }
  search() {
    if (this.queryString.keyword) {
      const regex = new RegExp(this.queryString.keyword, 'i'); // i for case insensitive
      this.query = this.query.find({
        $or: [{ title: regex }, { description: regex }],
      });
    }
    return this;
  }
  pagination() {
    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit || 9;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
  selectFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v'); // default: all fields except __v
    }
    return this;
  }
}
export default ApiFeatures;
