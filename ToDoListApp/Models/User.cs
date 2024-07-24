using System.Text.Json.Serialization;

namespace ToDoListApp.Models
{
   
    public class User
    {
        public int UserId { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }

        [JsonIgnore] // Döngüyü önlemek için
        public ICollection<Note> Notes { get; set; }
        public bool IsDeleted { get; set; }
        public Role Role { get; set; }

    }
}
