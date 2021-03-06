import test from 'tape';
import {
  Orientation,
  ShipType,
  validateShipPlacement
} from '../src/validations';

function getValidShipPlacement(): any {
  return {
    [ShipType.Submarine]: {
      origin: [0, 0],
      orientation: Orientation.Horizontal
    },
    [ShipType.Destroyer]: {
      origin: [2, 1],
      orientation: Orientation.Horizontal
    },
    [ShipType.Battleship]: {
      origin: [0, 1],
      orientation: Orientation.Vertical
    }
  };
}

test('successfully validates, and returns an object that matches the original input', (t) => {
  const result = validateShipPlacement(getValidShipPlacement());
  t.deepEqual(result, getValidShipPlacement());
  t.end();
});

test('throws an error for invalid payload data due to missing orientation and position', (t) => {
  const placement = getValidShipPlacement();

  delete placement[ShipType.Battleship].origin;
  delete placement[ShipType.Battleship].orientation;

  try {
    validateShipPlacement(placement);
    t.fail();
  } catch (e) {
    t.match(e.toString(), /\"Battleship.origin\" is required/gi);
    t.match(e.toString(), /\"Battleship.orientation\" is required/gi);
    t.end();
  }
});

test('throws an error for invalid payload data with an extra/unknown piece/key', (t) => {
  const placement = getValidShipPlacement();

  placement['5'] = {
    origin: [1, 1],
    orientation: Orientation.Horizontal
  };

  try {
    validateShipPlacement(placement);
    t.fail();
  } catch (e) {
    t.match(e.toString(), /\"5\" is not allowed/gi);
    t.end();
  }
});

test('throws an error since a piece/key is missing', (t) => {
  const placement = getValidShipPlacement();

  delete placement[ShipType.Destroyer];

  try {
    validateShipPlacement(placement);
    t.fail();
  } catch (e) {
    t.match(e.toString(), /\"Destroyer\" is required/gi);
    t.end();
  }
});

test('throws an error since a piece/key has negative a co-ordinate', (t) => {
  const placement = getValidShipPlacement();

  placement[ShipType.Destroyer].origin = [-1, 2];

  try {
    validateShipPlacement(placement);
    t.fail();
  } catch (e) {
    t.match(
      e.toString(),
      /"Destroyer.origin\[0\]" must be greater than or equal to 0/gi
    );
    t.end();
  }
});

test('throws an error since a piece/key has a co-ordinate(s) greater than grid size', (t) => {
  const placement = getValidShipPlacement();

  placement[ShipType.Destroyer].origin = [5, 6];

  try {
    validateShipPlacement(placement);
    t.fail();
  } catch (e) {
    t.match(
      e.toString(),
      /"Destroyer.origin\[0\]" must be less than or equal to 4/gi
    );
    t.match(
      e.toString(),
      /"Destroyer.origin\[1\]" must be less than or equal to 4/gi
    );
    t.end();
  }
});

test('throws an error if a ship is hanging over the board edge', (t) => {
  const placement = {
    [ShipType.Submarine]: {
      origin: [0, 0],
      orientation: Orientation.Horizontal
    },
    [ShipType.Destroyer]: {
      origin: [2, 1],
      orientation: Orientation.Horizontal
    },
    [ShipType.Battleship]: {
      // x=3, so a ship of width 4 will be over the edge
      origin: [3, 1],
      orientation: Orientation.Horizontal
    }
  };

  try {
    validateShipPlacement(placement);
    t.fail();
  } catch (e) {
    t.match(e.toString(), /a ship is over the edge of the board/gi);
    t.end();
  }
});

test('throws an error if ships overlap', (t) => {
  const placement = {
    [ShipType.Submarine]: {
      origin: [0, 0],
      orientation: Orientation.Horizontal
    },
    [ShipType.Destroyer]: {
      origin: [2, 1],
      orientation: Orientation.Horizontal
    },
    [ShipType.Battleship]: {
      // This ship will intersect with the one above
      origin: [3, 1],
      orientation: Orientation.Vertical
    }
  };

  try {
    validateShipPlacement(placement);
    t.fail();
  } catch (e) {
    t.match(e.toString(), /ships are overlapping at grid \[3, 1\]/gi);
    t.end();
  }
});
