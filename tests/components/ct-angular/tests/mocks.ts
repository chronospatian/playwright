import * as sinon from 'sinon';

export function mockStore() {
  return {
    state: { text: "Hello" },
    dispatch: sinon.spy()
  }
}
