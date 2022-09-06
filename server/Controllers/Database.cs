using System.Data.SqlClient;

public class Database
{
    private static string? DB_CONNECTION_STRING;

    static Database()
    {
        // Environment.SetEnvironmentVariable("");
        // // DB_CONNECTION_STRING = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");
        // DB_CONNECTION_STRING = "Server=localhost;Database=pastebookdb;User Id=sa;Password=myPassw0rd;"; // for macintosh
        DB_CONNECTION_STRING = "Server=localhost;Database=pastebookdb;Trusted_Connection=True;"; // For windows
    }

    public static SqlConnection OpenDatabase()
    {
        var db = new SqlConnection(DB_CONNECTION_STRING);
        db.Open();
        return db;
    }

}