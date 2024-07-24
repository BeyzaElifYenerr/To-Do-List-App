using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ToDoListApp.Data;
using ToDoListApp.DTOs;
using ToDoListApp.Models;
using ToDoApp.Services;

namespace ToDoListApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly TokenService _tokenService;
        private readonly ILogger<UsersController> _logger;

        public UsersController(ApplicationDbContext context, TokenService tokenService, ILogger<UsersController> logger)
        {
            _context = context;
            _tokenService = tokenService;
            _logger = logger;
        }

        [HttpGet]
        [Authorize(Policy = "AdminPolicy")]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            _logger.LogInformation("Fetching all users.");
            var users = await _context.Users
                                       .Where(u => !u.IsDeleted)
                                       .ToListAsync();
            return Ok(users);
        }

        [HttpGet("{id}")]
        [Authorize(Policy = "AdminPolicy")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            _logger.LogInformation("Fetching user with ID {UserId}.", id);
            var user = await _context.Users
                                      .Where(u => !u.IsDeleted)
                                      .FirstOrDefaultAsync(u => u.UserId == id);

            if (user == null)
            {
                _logger.LogWarning("User with ID {UserId} not found.", id);
                return NotFound();
            }

            return Ok(user);
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginViewModel model)
        {
            _logger.LogInformation("User login attempt with username {Username}.", model.Username);

            if (ModelState.IsValid)
            {
                var user = _context.Users
                                    .FirstOrDefault(u => u.Username == model.Username && u.Password == model.Password && !u.IsDeleted);

                if (user != null)
                {
                    TokenDTO response = new TokenDTO
                    {
                        Token = _tokenService.CreateToken(user),
                        userId = user.UserId
                    };

                    _logger.LogInformation("User {Username} logged in successfully.", model.Username);
                    return Ok(response);
                }
                else
                {
                    _logger.LogWarning("Invalid login attempt for username {Username}.", model.Username);
                    ModelState.AddModelError(string.Empty, "Invalid login attempt.");
                    return Unauthorized("Invalid login attempt.");
                }
            }

            _logger.LogError("Login failed due to invalid model state for username {Username}.", model.Username);
            return BadRequest("Invalid model state.");
        }

        [HttpPost("register")]
        public IActionResult AddUser([FromBody] UserDto dto)
        {
            _logger.LogInformation("Adding new user with username {Username}.", dto.Username);

            var existingUser = _context.Users.FirstOrDefault(u => u.Username == dto.Username && !u.IsDeleted);
            if (existingUser != null)
            {
                _logger.LogWarning("Username {Username} is already taken.", dto.Username);
                return Conflict("Username is already taken.");
            }

            // Enum türüne dönüştürmeye gerek yoksa, doğrudan kullanabilirsiniz
            User user = new User
            {
                Username = dto.Username,
                Password = dto.Password,
                Role = dto.Role, // Enum türünde
                IsDeleted = false // Varsayılan olarak kullanıcı silinmemiş
            };
            _context.Users.Add(user);
            _context.SaveChanges();

            _logger.LogInformation("User with username {Username} added successfully.", dto.Username);
            return Ok("Kullanıcı başarıyla eklendi!");
        }

        [HttpPut("{id}")]
        //[Authorize(Policy = "AdminPolicy")]
        public IActionResult UpdateUser(int id, [FromBody] UserDto dto)
        {
            _logger.LogInformation("Updating user with ID {UserId}.", id);

            var existingUser = _context.Users.FirstOrDefault(u => u.UserId == id && !u.IsDeleted);

            if (existingUser == null)
            {
                _logger.LogWarning("User with ID {UserId} not found for update.", id);
                return NotFound("Belirtilen Id'ye sahip kullanıcı bulunamadı.");
            }

            // Enum türüne dönüştürmeye gerek yoksa, doğrudan kullanabilirsiniz
            existingUser.Username = dto.Username;
            existingUser.Password = dto.Password;
            existingUser.Role = dto.Role; // Enum türünde

            _context.SaveChanges();
            _logger.LogInformation("User with ID {UserId} updated successfully.", id);
            return Ok("Kullanıcı başarıyla güncellendi!");
        }


        [HttpDelete("{id}")]
        //[Authorize(Policy = "AdminPolicy")]
        public IActionResult DeleteUser(int id)
        {
            _logger.LogInformation("Deleting user with ID {UserId}.", id);

            var existingUser = _context.Users.FirstOrDefault(u => u.UserId == id && !u.IsDeleted);

            if (existingUser == null)
            {
                _logger.LogWarning("User with ID {UserId} not found for deletion.", id);
                return NotFound("Belirtilen Id'ye sahip kullanıcı bulunamadı.");
            }

            existingUser.IsDeleted = true; // Kullanıcıyı "silinmiş" olarak işaretle
            _context.SaveChanges();

            _logger.LogInformation("User with ID {UserId} deleted successfully.", id);
            return Ok("Kullanıcı başarıyla silindi!");
        }
    }
}
