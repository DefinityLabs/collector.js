const Collector = require("../lib/collector");

describe("collector.js", () => {
  describe("Collector", () => {
    let fncA, fncB, fncC;

    beforeEach(() => {
      fncA = jest.fn(cb => cb(null, "A"));
      fncB = jest.fn(cb => {
        setTimeout(() => cb(null, "B"), 100);
      });
      fncC = jest.fn(cb => cb(null, "C"));
    });

    describe("when the functions are triggered", () => {
      it("calls done once all functions have been triggered", done => {
        let collector = new Collector();
        collector.trigger("a", fncA);
        collector.trigger("b", fncB);
        collector.trigger("c", fncC);

        collector.done(results => {
          expect(results.a.err).toBeNull();
          expect(results.a.data).toEqual("A");
          expect(results.b.err).toBeNull();
          expect(results.b.data).toEqual("B");
          expect(results.c.err).toBeNull();
          expect(results.c.data).toEqual("C");

          done();
        });
      });
    });

    describe("when done is defined before trigger", () => {
      it("throws error `Nothing has been triggered`", () => {
        let collector = new Collector();
        expect(() => collector.done(results => {})).toThrowError(
          "Nothing has been triggered"
        );
      });
    });

    describe("when function throws error", () => {
      it("adds error to response", done => {
        fncB = jest.fn(() => {
          throw new Error("Error");
        });

        let collector = new Collector();
        collector.trigger("a", fncA);
        collector.trigger("b", fncB);
        collector.trigger("c", fncC);

        collector.done(results => {
          expect(results.a.err).toBeNull();
          expect(results.a.data).toEqual("A");
          expect(results.b.err).not.toBeNull();
          expect(results.b.err.message).toEqual("Error");
          expect(results.b.data).toBeUndefined();
          expect(results.c.err).toBeNull();
          expect(results.c.data).toEqual("C");

          done();
        });
      });
    });
  });

  describe("all", () => {
    let fncA, fncB, fncC;

    beforeEach(() => {
      fncA = jest.fn(cb => cb(null, "A"));
      fncB = jest.fn(cb => {
        setTimeout(() => cb(null, "B"), 200);
      });
      fncC = jest.fn(cb => cb(null, "C"));
    });

    it("calls the callback with the matrix of function responses", done => {
      Collector.all([fncA, fncB, fncC], data => {
        expect(data[0][0]).toBeNull();
        expect(data[0][1]).toEqual("A");
        expect(data[1][0]).toBeNull();
        expect(data[1][1]).toEqual("B");
        expect(data[2][0]).toBeNull();
        expect(data[2][1]).toEqual("C");

        done();
      });
    });
  });

  describe("sequence", () => {
    let fncA, fncB, fncC;

    beforeEach(() => {
      fncA = jest.fn(cb => cb(null, "A"));
      fncB = jest.fn(cb => cb(null, "B"));
      fncC = jest.fn(cb => cb(null, "C"));
    });

    it("calls the same callback for each function", () => {
      let callback = jest.fn();

      Collector.sequence([fncA, fncB, fncC], callback);

      expect(callback).toHaveBeenCalledTimes(3);
      expect(callback).toHaveBeenCalledWith(null, "A");
      expect(callback).toHaveBeenCalledWith(null, "B");
      expect(callback).toHaveBeenCalledWith(null, "C");
    });
  });

  describe("exec", () => {
    let fncA, fncB, fncC;

    beforeEach(() => {
      fncA = jest.fn(cb => cb(null, "A"));
      fncB = jest.fn((text, cb) => cb(null, text + "B"));
      fncC = jest.fn((text, cb) => cb(null, text + "C"));
    });

    it("calls one function after another, sending its parameters to the next callback", () => {
      let callback = jest.fn();

      Collector.exec(fncA)
        .then(fncB)
        .then(fncC)
        .done((err, text) => {
          expect(err).toBeNull();
          expect(text).toEqual("ABC");
        });
    });

    describe("when a function throws error", () => {
      beforeEach(() => {
        fncA = jest.fn(cb => cb(null, "A"));
        fncB = jest.fn((text, cb) => cb(new Error("Error")));
        fncC = jest.fn((text, cb) => cb(null, text + "C"));
      });

      it("calls the callback with the error", () => {
        let callback = jest.fn();

        Collector.exec(fncA)
          .then(fncB)
          .then(fncC)
          .done((err, text) => {
            expect(err.message).toEqual("Error");
            expect(text).toBeUndefined();
          });
      });
    });
  });
});
