import java.io.*;
import java.util.*;

class Position {
  double x;
  double y;
  double z;
  double time;

  Position(x_pos, y_pos, z_pos, timestamp) {
    x = x_pos;
    y = y_pos;
    z = z_pos;
    time = timestamp;
  }
}

// all queries go to client side, only push to server when there's a change
// translate all of this to javascript
// push all updates to the server
// use a JSON file
// have a hard coded play button, once it starts then it plays


// 0. Come up with more discrete steps for project plan
// 1. Two dancers moving across the stage when you hit play. hard coded
// 2. When you are not playing, be able to drag one person from one place to another at a time. Hook this up
// to something that modifies the internal data structure. Make this be the starting position before the play button is hit. Figure
// out mouse input.
// 3. Figure out how to add a new key frame in.
// 4.

class Dancer {
  // store the times sorted
  ArrayList<Position> positions;
  String name;
  String color;

  Dancer(String n) {
    name = n;
    color = "ffffff";
    positions = new ArrayList<Position>();
  }

  // adds a position to the dancer's set of positions
  public void addPosition(Position p) {
    positions.add(p);
    return;
  }

  // gets a position for a given time
  public Position getPosition(Double t) {
    for (int i = 0; i < positions.length; i++) {
      if (positions[i].time == t) {
        return positions[i];
      }
    }
    return null;
  }

  // removes the position at the time specified
  public void removePosition(Double t) {
    for (int i = 0; i < positions.length; i++) {
      if (positions[i].time == t) {
        positions.remove(i);
        return;
      }
    }
    return;
  }
}

class Stage {
  // all of the dancers in the dance
	ArrayList<Dancer> dancers;

  Stage() {
    dancers = new ArrayList<Dancer>();
    formations = new HashSet<Double time, HashSet<String name, Position pos>>();
  }

  // adds a dancer to the stage
  public void addDancer(Dancer d){
    dancers.add(d);
  }

  public void addFormation() {

  }

  // returns the formation at a given time
  public HashSet<String name, Position pos> loadFormation(Double time){
    return keyFrames.get(time);
  }

}

// Given a time, query where all of the dancers are at that time
// Updates: add a key frame for a given dancer at a given time with a given position. OR
// update with a given dancer and a key frame, some time and position


class DanceDesigner {
  public static void main(String[] args) {
    ArrayList<String> strings = new ArrayList<String>();
    strings.add("Hello, World!");
    strings.add("Welcome to CoderPad.");
    strings.add("This pad is running Java " + Runtime.version().feature());

    for (String string : strings) {
      System.out.println(string);
    }
  }
}
