module {
  public type UserId = Principal;
  public type ProjectId = Nat;
  public type TaskId = Nat;
  public type Timestamp = Int;

  public type ProjectRole = {
    #admin;
    #member;
  };

  public type TaskStatus = {
    #toDo;
    #inProgress;
    #completed;
  };
};
