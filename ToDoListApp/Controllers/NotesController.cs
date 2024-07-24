using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging; // ILogger için
using ToDoListApp.Data;
using ToDoListApp.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ToDoListApp.DTO_s;
using System.Security.Claims;

namespace ToDoListApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
   // [Authorize(Policy = "UserPolicy")] // Tüm controller'ı yetkilendirme gerektirecek şekilde işaretler
    public class NotesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<NotesController> _logger;

        public NotesController(ApplicationDbContext context, ILogger<NotesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        [Authorize(Policy = "AdminPolicy")]
        public async Task<ActionResult<IEnumerable<Note>>> GetNotes()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                _logger.LogWarning("User ID not found in claims.");
                return Unauthorized();
            }

            _logger.LogInformation("Fetching all notes for user ID {UserId}.", userId);
            var notes = await _context.Notes.ToListAsync();
            return Ok(notes);
        }

        [HttpGet("user")]
        [Authorize(Policy = "UserPolicy")]
        public async Task<ActionResult<IEnumerable<Note>>> GetNotesByUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                _logger.LogWarning("User ID claim not found.");
                return Unauthorized();
            }

            int userId = int.Parse(userIdClaim.Value);
            _logger.LogInformation("Fetching notes for user ID {UserId}.", userId);

            var notes = await _context.Notes.Where(n => n.UserId == userId && !n.IsDeleted).ToListAsync();

            if (!notes.Any())
            {
                _logger.LogInformation("No notes found for user ID {UserId}.", userId);
                return NotFound();
            }

            return Ok(notes);
        }

        [HttpPost]
        [Authorize(Policy = "UserPolicy")]
        public async Task<ActionResult<Note>> PostNote(NoteDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                _logger.LogWarning("User ID not found in claims.");
                return Unauthorized();
            }

            var note = new Note
            {
                Text = dto.Text,
                Title = dto.Title,
                UserId = int.Parse(userId)
            };

            _logger.LogInformation("Adding new note for user ID {UserId}.", userId);
            try
            {
                _context.Notes.Add(note);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Note added successfully for user ID {UserId}.", userId);
                return Ok(note); // Yeni eklenen notu döndür
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Database update error while adding note for user ID {UserId}.", userId);
                return StatusCode(500, $"Database update error: {ex.Message}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Internal server error while adding note for user ID {UserId}.", userId);
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{noteId}")]
        [Authorize(Policy = "UserPolicy")]
        public async Task<IActionResult> PutNote(int noteId, [FromBody] NoteDto dto)
        {
            _logger.LogInformation("Updating note with ID {NoteId}.", noteId);

            var note = await _context.Notes.FindAsync(noteId);

            if (note == null)
            {
                _logger.LogWarning("Note with ID {NoteId} not found.", noteId);
                return NotFound();
            }

            note.Text = dto.Text;
            note.Title = dto.Title;

            try
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation("Note with ID {NoteId} updated successfully.", noteId);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!NoteExists(noteId))
                {
                    _logger.LogWarning("Note with ID {NoteId} does not exist.", noteId);
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpDelete]
        [Authorize(Policy = "UserPolicy")]
        public async Task<IActionResult> Delete(int id)
        {
            _logger.LogInformation("Deleting note with ID {NoteId}.", id);

            var note = await _context.Notes.FirstOrDefaultAsync(n => n.NoteId == id);

            if (note == null)
            {
                _logger.LogWarning("Note with ID {NoteId} not found.", id);
                return NotFound();
            }

            note.IsDeleted = true; // Notu silmek yerine IsDeleted alanını true yapıyoruz
            await _context.SaveChangesAsync();

            _logger.LogInformation("Note with ID {NoteId} marked as deleted.", id);
            return NoContent();
        }

        private bool NoteExists(int id)
        {
            return _context.Notes.Any(e => e.NoteId == id);
        }
    }
}
