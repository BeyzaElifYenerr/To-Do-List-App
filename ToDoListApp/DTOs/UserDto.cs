using ToDoListApp.Models;

namespace ToDoListApp.DTOs
{
    public class UserDto
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public Role Role { get; set; }
    }
}
