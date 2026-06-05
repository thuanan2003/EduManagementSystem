using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartEduWebAPI.Migrations
{
    /// <inheritdoc />
    public partial class MakeNotificationUserFlexible : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "StudentId",
                table: "Notifications",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "TeacherId",
                table: "Notifications",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_TeacherId",
                table: "Notifications",
                column: "TeacherId");

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_Teachers_TeacherId",
                table: "Notifications",
                column: "TeacherId",
                principalTable: "Teachers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_Teachers_TeacherId",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_TeacherId",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "TeacherId",
                table: "Notifications");

            migrationBuilder.AlterColumn<int>(
                name: "StudentId",
                table: "Notifications",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);
        }
    }
}
