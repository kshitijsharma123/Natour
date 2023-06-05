class APIFeature {
    //(Tour.find(),req.query)
  
    constructor(query, queryString) {
      this.query = query;
      this.queryString = queryString;
    }
  
    filter() {
      console.log("hello filter");
      const queryObj = { ...this.queryString };
      const excludedFields = ["page", "sort", "limit", "fields"];
  
      excludedFields.forEach((field) => {
        delete queryObj[field];
      });
  
      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
  
      // JSON.parse(queryStr)
      this.query(JSON.parse(queryString));
      return this;
    }
    sort() {
      if (this.queryString.sort) {
        const sortBy = this.queryString.sort.split(",").join(" ");
        this.queryDB = this.queryDB.sort(sortBy);
        console.log(sortBy);
      } else {
        this.queryDB = this.queryDB.sort("--createdAt");
      }
      return this;
    }
  
    fields() {
      if (this.queryString.fields) {
        const fields = this.queryString.fields.split(",").join(" ");
        this.queryDB = this.queryDB.select(fields);
        console.log(fields);
      } else {
        this.queryDB = this.queryDB.select("-__v");
      }
      return this;
    }
    pagination() {
      const page = this.queryString.page * 1 || 1;
      const limit = this.queryString.limit * 1 || 100;
      const skip = (page - 1) * limit;
  
      this.queryDB = this.queryDB.skip(skip).limit(limit);
      return this;
    }
  }