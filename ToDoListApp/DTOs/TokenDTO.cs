using ToDoListApp.Models;

namespace ToDoListApp.DTOs
{
    public class TokenDTO
    {
        public string Token { get; set; }
        public int userId { get; set; }
        public Role Role { get; set; }
    }
}
