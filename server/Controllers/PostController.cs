using System.Dynamic;
using Microsoft.AspNetCore.Mvc;

public class PostController : Controller
{
    [HttpPost]
    [Route("/createpost")]
    public IActionResult CreatePost([FromHeader(Name = "AuthToken")] string tokenString, [FromBody] PostModel Post)
    {
        if (Authenticate.AuthenticateToken(tokenString) != "VALID")
        {
            return Ok("invalidtoken");
        }
        int OwnerId = Int32.Parse(Authenticate.GetOwnerIdFromToken(tokenString));
        long datetimePosted = new DateTimeOffset(DateTime.Now).ToUnixTimeMilliseconds();

        using (var db = Database.OpenDatabase())
        {
            using (var command = db.CreateCommand())
            {
                command.CommandText = $@"INSERT INTO Posts 
                (OwnerId, Timestamp, Timeline, Content, ImageSrc)
                VALUES (@OwnerId, @Timestamp, @Timeline, @Content, @ImageSrc);";
                command.Parameters.AddWithValue("@OwnerId", OwnerId);
                command.Parameters.AddWithValue("@Timestamp", datetimePosted);
                command.Parameters.AddWithValue("@Timeline", Post.Timeline);
                command.Parameters.AddWithValue("@Content", Post.Content);
                command.Parameters.AddWithValue("@ImageSrc", Post.ImageSrc);
                command.ExecuteNonQuery();
            }
        }

        var postId = 0;

        using (var db = Database.OpenDatabase())
        {
            using (var command = db.CreateCommand())
            {
                //Getting multiple data from different tables
                command.CommandText = $@"SELECT Id FROM Posts WHERE OwnerId=@OwnerId";
                command.Parameters.AddWithValue("@OwnerId", OwnerId);
                var reader = command.ExecuteReader();
                while (reader.Read())
                {
                    postId = reader.GetInt32(0);
                }
            }
        }

        // Create Post action will be added to Activites table
        using (var db = Database.OpenDatabase())
        {
            using (var command = db.CreateCommand())
            {
                command.CommandText =
                    @"INSERT INTO Activities (OwnerId, Action, TargetId, Timestamp, State, Link)
                    VALUES (@OwnerId, @Action, @TargetId, @Timestamp, @State, @Link);";
                command.Parameters.AddWithValue("@OwnerId", OwnerId);
                command.Parameters.AddWithValue("@Action", "Post");
                command.Parameters.AddWithValue("@TargetId", Post.Timeline);
                command.Parameters.AddWithValue("@Timestamp", datetimePosted);
                command.Parameters.AddWithValue("@State", "Unread");
                command.Parameters.AddWithValue("@Link", "/posts/" + postId);
                command.ExecuteNonQuery();
            }
        }

        PostModel RecentPost = new PostModel();
        using (var db = Database.OpenDatabase())
        {
            using (var command = db.CreateCommand())
            {
                command.CommandText = $@"SELECT TOP 1 * FROM Posts ORDER BY Id DESC";
                var reader = command.ExecuteReader();
                while (reader.Read())
                {
                    RecentPost.Id = reader.GetInt32(0);
                    RecentPost.OwnerId = reader.GetInt32(1);
                    RecentPost.Timestamp = reader.GetInt64(2);
                    RecentPost.Timeline = reader.GetInt32(3);
                    RecentPost.Content = reader.GetString(4);
                    RecentPost.ImageSrc = reader.GetString(5);
                    RecentPost.NumLikes = GetLikes(reader.GetInt32(0));
                    RecentPost.NumComments = GetComments(reader.GetInt32(0));
                }
            }
        }
        return Ok(RecentPost);
    }

    [HttpGet]
    [Route("/newsfeedposts")]
    public IActionResult NewsFeedPosts([FromHeader(Name = "AuthToken")] string tokenString, [FromHeader(Name = "Page")] int Page)
    {
        if (Authenticate.AuthenticateToken(tokenString) != "VALID")
        {
            return Ok("invalidtoken");
        }
        List<PostModel> NewsFeedPosts = new List<PostModel>();
        int CurrentUserId = Int32.Parse(Authenticate.GetOwnerIdFromToken(tokenString));
        // AddDays(-14) parses posts within the last 2 weeks
        long postsAfterThisDate = new DateTimeOffset(DateTime.Now.AddDays(-14)).ToUnixTimeMilliseconds();
        // firendIdsCSV will return a CSV of friends' ids
        string friendIdsCSV = String.Join(",", GetFriends(tokenString, 0));

        using (var db = Database.OpenDatabase())
        {
            using (var command = db.CreateCommand())
            {
                command.CommandText = $@"SELECT * FROM Posts 
                WHERE Timestamp>@Timestamp AND
                (
                    (OwnerId IN ({friendIdsCSV}) AND Timeline=0) OR
                    (OwnerId IN ({friendIdsCSV}) AND Timeline=@Timeline) OR
                    (OwnerId=@OwnerId) OR 
                    (OwnerId=@OwnerId AND Timeline=@Timeline)
                )
                ORDER BY Timestamp DESC
                OFFSET @Offset ROW
                FETCH NEXT 5 ROWS ONLY;";
                command.Parameters.AddWithValue("@Timestamp", postsAfterThisDate);
                command.Parameters.AddWithValue("@Timeline", CurrentUserId);
                command.Parameters.AddWithValue("@OwnerId", CurrentUserId);
                command.Parameters.AddWithValue("@Offset", (Page - 1) * 5);
                // command.Parameters.AddWithValue("@NumberOfPosts", 5);
                var reader = command.ExecuteReader();
                while (reader.Read())
                {
                    PostModel Post = new PostModel();
                    // Id of post
                    Post.Id = reader.GetInt32(0);
                    // Id of post owner
                    Post.OwnerId = reader.GetInt32(1);
                    Post.Timestamp = reader.GetInt64(2);
                    Post.Timeline = reader.GetInt32(3);
                    Post.Content = reader.GetString(4);
                    Post.ImageSrc = reader.GetString(5);
                    Post.NumLikes = GetLikes(reader.GetInt32(0));
                    Post.NumComments = GetComments(reader.GetInt32(0));
                    NewsFeedPosts.Add(Post);
                }
            }
        }
        return Ok(NewsFeedPosts);
    }

    [HttpGet]
    [Route("/timelineposts")]
    public IActionResult TimelinePosts([FromHeader(Name = "AuthToken")] string tokenString, [FromHeader(Name = "ProfileOwner")] string ProfileOwnerUsername, [FromHeader(Name = "Page")] int Page)
    {
        if (Authenticate.AuthenticateToken(tokenString) != "VALID")
        {
            return Ok("invalidtoken");
        }
        int ProfileOwnerId = 0;
        List<PostModel> TimelinePosts = new List<PostModel>();
        // int CurrentUserId = Int32.Parse(Authenticate.GetOwnerIdFromToken(tokenString));
        // AddDays(-14) parses posts within the last 2 weeks
        long postsAfterThisDate = new DateTimeOffset(DateTime.Now.AddDays(-14)).ToUnixTimeMilliseconds();
        // firendIdsCSV will return a CSV of friends' ids
        using (var db = Database.OpenDatabase())
        {
            using (var command = db.CreateCommand())
            {
                command.CommandText = $@"SELECT * FROM UserProfiles WHERE Username=@Username;";
                command.Parameters.AddWithValue("@Username", ProfileOwnerUsername);
                var reader = command.ExecuteReader();
                while (reader.Read())
                {
                    ProfileOwnerId = reader.GetInt32(1);
                }
            }
        }
        string friendIdsCSV = String.Join(",", GetFriends("", ProfileOwnerId));

        using (var db = Database.OpenDatabase())
        {
            using (var command = db.CreateCommand())
            {
                command.CommandText = $@"SELECT * FROM Posts 
                WHERE Timestamp>@Timestamp AND
                (
                    (OwnerId IN ({friendIdsCSV}) AND Timeline=@Timeline) OR
                    (OwnerId=@OwnerId) OR 
                    (OwnerId=@OwnerId AND Timeline=@Timeline)
                )
                ORDER BY Timestamp DESC
                OFFSET @Offset ROW
                FETCH NEXT 10 ROWS ONLY;";
                command.Parameters.AddWithValue("@Timestamp", postsAfterThisDate);
                command.Parameters.AddWithValue("@Timeline", ProfileOwnerId);
                command.Parameters.AddWithValue("@OwnerId", ProfileOwnerId);
                command.Parameters.AddWithValue("@Offset", (Page - 1) * 10);
                // command.Parameters.AddWithValue("@NumberOfPosts", 5);
                var reader = command.ExecuteReader();
                while (reader.Read())
                {
                    PostModel Post = new PostModel();
                    // Id of post
                    Post.Id = reader.GetInt32(0);
                    // Id of post owner
                    Post.OwnerId = reader.GetInt32(1);
                    Post.Timestamp = reader.GetInt64(2);
                    Post.Timeline = reader.GetInt32(3);
                    Post.Content = reader.GetString(4);
                    Post.ImageSrc = reader.GetString(5);
                    Post.NumLikes = GetLikes(reader.GetInt32(0));
                    Post.NumComments = GetComments(reader.GetInt32(0));
                    TimelinePosts.Add(Post);
                }
            }
        }
        return Ok(TimelinePosts);
    }

    [HttpGet]
    [Route("/autoupdate")]
    public IActionResult AutoUpdate([FromHeader(Name = "AuthToken")] string tokenString, [FromHeader(Name = "Timestamp")] long Timestamp)
    {
        if (Authenticate.AuthenticateToken(tokenString) != "VALID")
        {
            return Ok("invalidtoken");
        }
        List<PostModel> NewPosts = new List<PostModel>();
        int CurrentUserId = Int32.Parse(Authenticate.GetOwnerIdFromToken(tokenString));
        // firendIdsCSV will return a CSV of friends' ids
        string friendIdsCSV = String.Join(",", GetFriends(tokenString, 0));

        using (var db = Database.OpenDatabase())
        {
            using (var command = db.CreateCommand())
            {
                command.CommandText = $@"SELECT * FROM Posts 
                WHERE Timestamp>@Timestamp AND
                (
                    (OwnerId IN ({friendIdsCSV}) AND Timeline=0) OR
                    (OwnerId IN ({friendIdsCSV}) AND Timeline=@Timeline) OR
                    (OwnerId=@OwnerId) OR 
                    (OwnerId=@OwnerId AND Timeline=@Timeline)
                )
                ORDER BY Timestamp DESC;";
                command.Parameters.AddWithValue("@Timestamp", Timestamp);
                command.Parameters.AddWithValue("@Timeline", CurrentUserId);
                command.Parameters.AddWithValue("@OwnerId", CurrentUserId);
                var reader = command.ExecuteReader();
                while (reader.Read())
                {
                    PostModel Post = new PostModel();
                    // Id of post
                    Post.Id = reader.GetInt32(0);
                    // Id of post owner
                    Post.OwnerId = reader.GetInt32(1);
                    Post.Timestamp = reader.GetInt64(2);
                    Post.Timeline = reader.GetInt32(3);
                    Post.Content = reader.GetString(4);
                    Post.ImageSrc = reader.GetString(5);
                    Post.NumLikes = GetLikes(reader.GetInt32(0));
                    Post.NumComments = GetComments(reader.GetInt32(0));
                    NewPosts.Add(Post);
                }
            }
        }
        return Ok(NewPosts);
    }

    private int GetLikes(int PostId)
    {
        int NumLikes = 0;
        using (var db = Database.OpenDatabase())
        {
            using (var command = db.CreateCommand())
            {
                command.CommandText = $@"SELECT COUNT(Id) FROM Likes WHERE Target='Post' AND TargetId=@TargetId";
                command.Parameters.AddWithValue("@TargetId", PostId);
                NumLikes = (Int32)command.ExecuteScalar();
            }
        }
        return NumLikes;
    }

    private int GetComments(int PostId)
    {
        int NumComments = 0;
        using (var db = Database.OpenDatabase())
        {
            using (var command = db.CreateCommand())
            {
                command.CommandText = $@"SELECT COUNT(Id) FROM Comments WHERE PostId=@PostId";
                command.Parameters.AddWithValue("@PostId", PostId);
                NumComments = (Int32)command.ExecuteScalar();
            }
        }
        return NumComments;
    }

    [HttpGet]
    [Route("/gettargetuser")]
    public IActionResult GetTargerUser([FromHeader(Name = "TargetUserId")] int TargetUserId)
    {
        dynamic NameAndUsername = new ExpandoObject();
        using (var db = Database.OpenDatabase())
        {
            using (var command = db.CreateCommand())
            {
                command.CommandText = $@"SELECT * FROM Users WHERE Id=@Id;";
                command.Parameters.AddWithValue("@Id", TargetUserId);
                var reader = command.ExecuteReader();
                while (reader.Read())
                {
                    NameAndUsername.FirstName = reader.GetString(2);
                    NameAndUsername.LastName = reader.GetString(3);
                }
            }
        }
        using (var db = Database.OpenDatabase())
        {
            using (var command = db.CreateCommand())
            {
                command.CommandText = $@"SELECT * FROM UserProfiles WHERE OwnerId=@OwnerId;";
                command.Parameters.AddWithValue("@OwnerId", TargetUserId);
                var reader = command.ExecuteReader();
                while (reader.Read())
                {
                    NameAndUsername.Username = reader.GetString(2);
                }
            }
        }
        return Ok(NameAndUsername);
    }

    [HttpGet]
    [Route("/getpostuser/{OwnerId}")]
    public IActionResult GetPosterInfo(int OwnerId)
    {
        UserModel User = new UserModel();
        using (var db = Database.OpenDatabase())
        {
            using (var command = db.CreateCommand())
            {
                command.CommandText = $@"SELECT * FROM Users WHERE Id=@Id;";
                command.Parameters.AddWithValue("@Id", OwnerId);
                var reader = command.ExecuteReader();
                while (reader.Read())
                {
                    User.FirstName = reader.GetString(2);
                    User.LastName = reader.GetString(3);
                }
            }
        }
        return Ok(User);
    }

    [HttpGet]
    [Route("/getpostuserprofile/{OwnerId}")]
    public IActionResult GetPosterProfile(int OwnerId)
    {
        UserProfileModel UserProfile = new UserProfileModel();
        using (var db = Database.OpenDatabase())
        {
            using (var command = db.CreateCommand())
            {
                command.CommandText = $@"SELECT * FROM UserProfiles WHERE OwnerId=@OwnerId;";
                command.Parameters.AddWithValue("@OwnerId", OwnerId);
                var reader = command.ExecuteReader();
                while (reader.Read())
                {
                    UserProfile.Username = reader.GetString(2);
                    UserProfile.ImageSrc = reader.GetString(4);
                }
            }
        }
        return Ok(UserProfile);
    }

    [HttpGet]
    [Route("/posts/{PostId}")]
    public IActionResult GetSinglePost(int PostId)
    {
        PostModel Post = new PostModel();
        using (var db = Database.OpenDatabase())
        {
            using (var command = db.CreateCommand())
            {
                command.CommandText = $@"SELECT * FROM Posts WHERE Id=@Id";
                command.Parameters.AddWithValue("@Id", PostId);
                var reader = command.ExecuteReader();
                while (reader.Read())
                {
                    Post.Id = reader.GetInt32(0);
                    Post.OwnerId = reader.GetInt32(1);
                    Post.Timestamp = reader.GetInt64(2);
                    Post.Timeline = reader.GetInt32(3);
                    Post.Content = reader.GetString(4);
                    Post.ImageSrc = reader.GetString(5);
                    Post.NumLikes = GetLikes(reader.GetInt32(0));
                    Post.NumComments = GetComments(reader.GetInt32(0));
                }
            }
        }
        if (Post.Id == 0)
        {
            return Ok("doesnotexist");
        }
        return Ok(Post);
    }

    [HttpDelete]
    [Route("/posts/{PostId}")]
    public IActionResult DeletePost([FromHeader(Name = "AuthToken")] string tokenString, int PostId)
    {
        if (Authenticate.AuthenticateToken(tokenString) != "VALID")
        {
            return Ok("invalidtoken");
        }
        using (var db = Database.OpenDatabase())
        {
            using (var command = db.CreateCommand())
            {
                command.CommandText = $@"DELETE FROM Posts WHERE Id=@Id;";
                command.Parameters.AddWithValue("@Id", PostId);
                command.ExecuteNonQuery();
            }
        }

        using (var db = Database.OpenDatabase())
        {
            using (var command = db.CreateCommand())
            {
                command.CommandText = $@"DELETE FROM Comments WHERE PostId=@PostId;";
                command.Parameters.AddWithValue("@PostId", PostId);
                command.ExecuteNonQuery();
            }
        }
        return Ok("deleted");
    }

    [HttpPatch]
    [Route("/posts/{PostId}")]
    public IActionResult PatchPost([FromHeader(Name = "AuthToken")] string tokenString, [FromBody] PostModel Post, int PostId)
    {
        if (Authenticate.AuthenticateToken(tokenString) != "VALID")
        {
            return Ok("invalidtoken");
        }
        using (var db = Database.OpenDatabase())
        {
            using (var command = db.CreateCommand())
            {
                command.CommandText = $@"UPDATE Posts SET Content=@Content WHERE Id=@Id;";
                command.Parameters.AddWithValue("@Content", Post.Content);
                command.Parameters.AddWithValue("@Id", PostId);
                command.ExecuteNonQuery();
            }
            if (Post.ImageSrc != "")
            {
                using (var command = db.CreateCommand())
                {
                    command.CommandText = $@"UPDATE Posts SET ImageSrc=@ImageSrc WHERE Id=@Id;";
                    command.Parameters.AddWithValue("@ImageSrc", Post.ImageSrc);
                    command.Parameters.AddWithValue("@Id", PostId);
                    command.ExecuteNonQuery();
                }
            }
        }
        return Ok("updated");
    }

    public static List<int> GetFriends(string tokenString, int ProfileUserId)
    {
        int CurrentUserId = 0;
        if (tokenString != "")
        {
            CurrentUserId = Int32.Parse(Authenticate.GetOwnerIdFromToken(tokenString));
        }
        if (ProfileUserId != 0)
        {
            CurrentUserId = ProfileUserId;
        }

        List<int> FriendIds = new List<int>();
        FriendIds.Add(0);
        using (var db = Database.OpenDatabase())
        {
            using (var command = db.CreateCommand())
            {
                command.CommandText = $@"SELECT * FROM Friends WHERE OwnerId=@OwnerId;";
                command.Parameters.AddWithValue("@OwnerId", CurrentUserId);
                var reader = command.ExecuteReader();
                while (reader.Read())
                {
                    FriendIds.Add(reader.GetInt32(2));
                }
            }
        }
        return FriendIds;
    }
}